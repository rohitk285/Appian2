from unsloth import FastVisionModel
import torch
from transformers import TextStreamer
from trl import DPOTrainer
from datasets import Dataset
import random
from dataclasses import dataclass
from typing import List, Dict, Any
import json

@dataclass
class RLHFResponse:
    response: str
    rank: int = 0
    score: float = 0.0

class DocClassifierRLHF:
    def __init__(self, base_model_name="unsloth/Llama-3.2-11B-Vision-Instruct"):
        # Initialize base model
        self.model, self.tokenizer = FastVisionModel.from_pretrained(
            base_model_name,
            load_in_4bit=True,
            use_gradient_checkpointing="unsloth"
        )
        
        # Initialize reference model for DPO
        self.ref_model, _ = FastVisionModel.from_pretrained(
            base_model_name,
            load_in_4bit=True,
            use_gradient_checkpointing="unsloth"
        )

    def generate_multiple_responses(self, image, num_responses=4):
        """Generate multiple different responses for the same document"""
        FastVisionModel.for_inference(self.model)
        
        responses = []
        temperatures = [0.7, 1.0, 1.3, 1.5]  # Different temperatures for variety
        
        instruction = """You are a document analysis expert. Analyze this document and provide:
        1. Document type
        2. All key information (names, dates, numbers)
        3. Important details specific to this document type
        Format response as detailed JSON."""

        messages = [
            {"role": "user", "content": [
                {"type": "image"},
                {"type": "text", "text": instruction}
            ]}
        ]
        
        input_text = self.tokenizer.apply_chat_template(messages, add_generation_prompt=True)
        inputs = self.tokenizer(
            image,
            input_text,
            add_special_tokens=False,
            return_tensors="pt"
        ).to("cuda")

        for temp in temperatures[:num_responses]:
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=256,
                use_cache=True,
                temperature=temp,
                min_p=0.1,
                do_sample=True,
                top_k=50
            )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            responses.append(RLHFResponse(response=response))
            
        return responses

    def collect_human_feedback(self, responses: List[RLHFResponse]):
        """Collect and process human rankings of responses"""
        print("\nPlease rank the following responses from best (1) to worst (4):\n")
        
        for i, resp in enumerate(responses, 1):
            print(f"\nResponse {i}:")
            print(resp.response)
        
        rankings = []
        while True:
            try:
                rankings = input("\nEnter rankings (comma-separated, e.g., 1,3,4,2): ").split(',')
                rankings = [int(r) for r in rankings]
                if len(rankings) != len(responses) or not all(1 <= r <= len(responses) for r in rankings):
                    raise ValueError
                break
            except ValueError:
                print(f"Please enter {len(responses)} valid rankings from 1 to {len(responses)}")
        
        # Assign rankings and convert to preference scores
        for rank, resp in zip(rankings, responses):
            resp.rank = rank
            resp.score = 1.0 / rank  # Higher score for better rank
        
        return responses

    def prepare_dpo_dataset(self, feedback_data: List[Dict[str, Any]]):
        """Convert feedback data to DPO format"""
        dpo_data = []
        
        for item in feedback_data:
            responses = sorted(item['responses'], key=lambda x: x.score, reverse=True)
            
            # Create pairs of responses (better vs worse)
            for i in range(len(responses)-1):
                dpo_data.append({
                    'prompt': item['prompt'],
                    'chosen': responses[i].response,
                    'rejected': responses[i+1].response,
                })
        
        return Dataset.from_list(dpo_data)

    def train_with_dpo(self, dpo_dataset):
        """Train the model using DPO"""
        trainer = DPOTrainer(
            model=self.model,
            ref_model=self.ref_model,
            tokenizer=self.tokenizer,
            train_dataset=dpo_dataset,
            args=DPOTrainer.DPOConfig(
                per_device_train_batch_size=2,
                gradient_accumulation_steps=4,
                learning_rate=2e-5,
                max_steps=200,
                beta=0.1,  # DPO loss parameter
                fp16=True,
                output_dir="dpo_outputs"
            ),
        )
        
        trainer.train()

def run_rlhf_iteration(rlhf_system):
    """Run a single iteration of RLHF"""
    # Load and process document
    from PIL import Image
    image_path = input("Enter path to document image: ")
    image = Image.open(image_path)
    
    # Generate multiple responses
    responses = rlhf_system.generate_multiple_responses(image)
    
    # Collect human feedback
    ranked_responses = rlhf_system.collect_human_feedback(responses)
    
    # Prepare feedback data
    feedback_data = [{
        'prompt': "Document analysis task",
        'responses': ranked_responses,
    }]
    
    # Create DPO dataset
    dpo_dataset = rlhf_system.prepare_dpo_dataset(feedback_data)
    
    # Train with DPO
    rlhf_system.train_with_dpo(dpo_dataset)
    
    return ranked_responses