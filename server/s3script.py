import sqlite3
import os
import requests
from dotenv import load_dotenv
import boto3
import time

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
CX = os.getenv("GOOGLE_CX")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
BUCKET_NAME = 'pccomposer'

s3 = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

def get_slugs_from_db(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT slug FROM Computer_Part;")
    slugs = [row[0] for row in cursor.fetchall()]
    conn.close()
    return slugs

def fetch_first_image_url(query):
    search_url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "cx": CX,
        "key": API_KEY,
        "searchType": "image",
        "num": 1
    }

    try:
        response = requests.get(search_url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "items" in data and len(data["items"]) > 0:
                return data["items"][0]["link"]
            else:
                print(f"No images found for query: {query}")
                return None
        else:
            print(f"Error fetching image for query {query}: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.Timeout:
        return None
    except Exception as e:
        return None

def download_image(url, local_file_path, retries=3):
    for attempt in range(retries):
        try:
            print(f"Downloading image from {url} (attempt {attempt + 1})")
            response = requests.get(url, stream=True, timeout=10)
            if response.status_code == 200:
                with open(local_file_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                return True
            else:
                print(f"Failed to download image. HTTP Status: {response.status_code}")
        except requests.exceptions.Timeout:
            print(f"Timeout while downloading image from {url}")
        except Exception as e:
            print(f"Error downloading image from {url}: {e}")
        time.sleep(2)
    print(f"Failed to download image after {retries} attempts: {url}")
    return False

def upload_to_s3(file_path, bucket_name, object_name):
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        s3.upload_file(file_path, bucket_name, object_name)
        print(f"Uploaded {file_path} to S3 as {object_name}")
    except Exception as e:
        print(f"Failed to upload {file_path} to S3: {e}")

def main():
    db_path = 'database.db'
    slugs = get_slugs_from_db(db_path)

    for slug in slugs:
        print(f"Processing slug: {slug}")
        image_url = fetch_first_image_url(slug)
        
        if image_url:
            local_file_path = f"{slug}.jpg"
            if download_image(image_url, local_file_path):
                if os.path.exists(local_file_path):
                    upload_to_s3(local_file_path, BUCKET_NAME, f"{slug}.jpg")
                    os.remove(local_file_path)
                else:
                    print(f"File not found after download: {local_file_path}")
        else:
            print(f"No image found for slug {slug}")

if __name__ == "__main__":
    main()
