from flask import Flask, render_template, request, jsonify
import json
import string
import nltk

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ===============================
# Download NLTK Data (First Run)
# ===============================

try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")
try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download("stopwords")

# ===============================
# Flask App
# ===============================

app = Flask(__name__)

# ===============================
# Load FAQ Data
# ===============================

with open("faq_data.json", "r", encoding="utf-8") as file:
    faq_data = json.load(file)

questions = [item["question"] for item in faq_data]
answers = [item["answer"] for item in faq_data]

# ===============================
# Text Preprocessing
# ===============================

stop_words = set(stopwords.words("english"))

def preprocess(text):

    text = text.lower()

    text = text.translate(
        str.maketrans("", "", string.punctuation)
    )

    tokens = word_tokenize(text)

    filtered = [
        word
        for word in tokens
        if word not in stop_words
    ]

    return " ".join(filtered)

# ===============================
# Train TF-IDF
# ===============================

processed_questions = [
    preprocess(q)
    for q in questions
]

vectorizer = TfidfVectorizer()

question_vectors = vectorizer.fit_transform(
    processed_questions
)

# ===============================
# Find Best Answer
# ===============================

def chatbot_reply(user_question):

    processed = preprocess(user_question)

    user_vector = vectorizer.transform([processed])

    similarity = cosine_similarity(
        user_vector,
        question_vectors
    )

    score = similarity.max()

    index = similarity.argmax()

    if score < 0.15:

        return {
            "answer":
            "Sorry 😔 I couldn't find a relevant answer. Please try another question."
        }

    return {
        "answer": answers[index]
    }
    # ===============================
# Flask Routes
# ===============================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    user_message = data.get("message", "").strip()

    if user_message == "":
        return jsonify({
            "answer": "Please type a question."
        })

    result = chatbot_reply(user_message)

    return jsonify(result)


# ===============================
# Run Server
# ===============================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )