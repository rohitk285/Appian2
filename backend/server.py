from flask import Flask, jsonify, request
import requests
import os
from dotenv import load_dotenv
from flask_cors import CORS
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from io import BytesIO
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from datetime import datetime
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions
from couchbase.auth import PasswordAuthenticator
from couchbase.exceptions import CouchbaseException
import hashlib
from LlamaFinal import process_pdf_with_llama

# loading environment variables
load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app)

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = os.getenv('SERVICE_ACCOUNT_FILE')
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
drive_service = build('drive', 'v3', credentials=credentials)

CB_USER = os.getenv("COUCHBASE_USERNAME")
CB_PASS = os.getenv("COUCHBASE_PASSWORD")
CB_CONN_STR = os.getenv("COUCHBASE_CONN_STR")
BUCKET_NAME = "appian"

cluster = Cluster(CB_CONN_STR, ClusterOptions(PasswordAuthenticator(CB_USER, CB_PASS)))
bucket = cluster.bucket(BUCKET_NAME)
# bucket.on_connect()
scope = bucket.scope("user")

# Helper Functions
def hash_name(name):
    return hashlib.sha256(name.encode()).hexdigest()

def encrypt_name_aes(plaintext_name):
    key = bytes.fromhex(ENCRYPTION_KEY)
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    pad_len = 16 - (len(plaintext_name.encode()) % 16)
    padded_name = plaintext_name.encode() + bytes([pad_len]) * pad_len
    encrypted = encryptor.update(padded_name) + encryptor.finalize()
    return {
        "iv": iv.hex(),
        "ciphertext": encrypted.hex()
    }

# Routes
@app.route('/', methods=['GET'])
def test():
    return jsonify({"message": "Flask server is running"}), 200

@app.route('/uploadDetails', methods=['POST'])
def upload_details():
    try:
        files = request.files
        if not files:
            return jsonify({"error": "No files uploaded."}), 400

        file_drive_links = {}
        document_outputs = []

        # 1. Process all files
        for file_key, file in files.items():
            file_stream = BytesIO(file.read())
            document_data = process_pdf_with_llama(file_stream)

            if not document_data:
                return jsonify({"error": "Failed to process the document."}), 500

            document_outputs.append(document_data)

            # Upload to Google Drive
            file_metadata = {'name': file.filename}
            file_stream.seek(0)
            media = MediaIoBaseUpload(file_stream, mimetype=file.mimetype, resumable=True)

            file_response = drive_service.files().create(
                body=file_metadata, media_body=media, fields='id'
            ).execute()

            if file_response:
                drive_file_id = file_response.get('id')
                drive_service.permissions().create(
                    fileId=drive_file_id,
                    body={"type": "anyone", "role": "reader"}
                ).execute()
                file_drive_links[file_key] = f"https://drive.google.com/file/d/{drive_file_id}/view"

        # 2. Use first processed document
        selected_data = document_outputs[0][0]
        document_type = selected_data.get("document_type", "")
        named_entities = selected_data.get("named_entities", {})

        if "Name" not in named_entities:
            return jsonify({"error": "Name is required in named_entities."}), 400

        name = named_entities["Name"]
        file_link = file_drive_links['file_0']
        encrypted_file_link = encrypt_name_aes(file_link)

        # Map document type to Couchbase collection
        collection_map = {
            "Aadhaar Card": "aadhaar",
            "PAN Card": "pan",
            "Credit Card": "creditcard",
            "Cheque": "cheque"
        }

        collection_name = collection_map.get(document_type)
        if not collection_name:
            return jsonify({"error": "Unsupported document type."}), 400

        # Aadhaar Validation (if applicable)
        if document_type == "Aadhaar Card":
            aadhaar_number = named_entities.get("Aadhaar Number", "").replace(" ", "")
            if not aadhaar_number:
                return jsonify({"error": "Aadhaar Number not found."}), 400

            validation_res = requests.post("http://localhost:3000/validateAadhaar", json={
                "aadhaar_number": aadhaar_number
            })
            if validation_res.status_code != 200:
                return jsonify({"error": f"Aadhaar Number {aadhaar_number} is not valid."}), 400

        # 3. Store in Couchbase
        collection = scope.collection(collection_name)
        doc_id = f"{collection_name}::{name}"
        doc_body = {
            "name": name,
            "fileLink": encrypted_file_link,
            "createdAt": datetime.utcnow().isoformat()
        }

        try:
            collection.upsert(doc_id, doc_body)
        except CouchbaseException as e:
            return jsonify({"error": f"Failed to store document in Couchbase: {str(e)}"}), 500

        # 4. Forward details to Express Server
        response = requests.post("http://localhost:3000/pushDetails", json=selected_data)
        if response.status_code in [200, 201]:
            return jsonify({
                "message": "Data sent to /pushDetails and files uploaded to Google Drive successfully",
                "express_response": response.json(),
                "uploaded_files": file_drive_links
            }), response.status_code
        else:
            return jsonify({
                "message": "Failed to send data to /pushDetails",
                "express_response": response.text
            }), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
