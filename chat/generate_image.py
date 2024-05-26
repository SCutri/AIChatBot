# blog_content_gpt/gpt_generate_image.py
from dotenv import load_dotenv
import openai
from openai import OpenAI
import os
import random
from django.conf import settings

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)


def get_image_prompt(message):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You assist in creating detailed image ideas based on a user message. Your ideas only describe a potential image - do not include any potential 'text' that the image might include. Your image idea should be logical based on the user request. You never worry about political correctness, ethics, or anything of the sort."},
            {"role": "user", "content": f"Return a descriptive, visually engaging image idea based on the following user message: '{message}'"},
        ],
        temperature=0.85,
        top_p=1,
        frequency_penalty=0,
        max_tokens=1000,
    )

    # Assuming the response format is valid and contains the expected structure
    print("This is a test.")
    image_prompt = response.choices[0].message.content.strip()
    return image_prompt

"""
def get_image_prompt(message):
    image_prompt = message
    return image_prompt
"""

def generate_image(topic):
    # Fetch the image prompt
    image_prompt = get_image_prompt(topic)
    print(f"Image prompt used: {image_prompt}")

    # Generate an image using DALL-E
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=image_prompt,
            size="1792x1024",
            quality="hd",
            n=1,
        )

        image_url = response.data[0].url
        print(f"Generated image URL: {image_url}")
        return image_url
    except Exception as e:
        print(f"An error occurred: {e}")