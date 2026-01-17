from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DASHBOARD_DIR = os.path.join(BASE_DIR, "Dashboard")

app = Flask(__name__)
CORS(app)

# Load dataset
csv_path = os.path.join(BASE_DIR, "spotify dataset.csv")
df = pd.read_csv(csv_path)

# Convert duration
df["duration_min"] = (df["duration_ms"] / 60000).round(2)

# Search helpers
df["search_name"] = df["track_name"].str.lower().fillna("")
df["search_artist"] = df["track_artist"].str.lower().fillna("")


# ---------------- FRONTEND ----------------
@app.route("/")
def home():
    return send_from_directory(DASHBOARD_DIR, "index.html")


@app.route("/<path:filename>")
def dashboard_files(filename):
    return send_from_directory(DASHBOARD_DIR, filename)


# ---------------- API ----------------
@app.route("/categories")
def categories():
    return jsonify({
        "genres": sorted(df["playlist_genre"].dropna().unique().tolist()),
        "subgenres": sorted(df["playlist_subgenre"].dropna().unique().tolist())
    })


@app.route("/songs")
def songs():
    query = request.args.get("query", "").lower()
    if not query:
        return jsonify([])

    mask = (
        df["search_name"].str.contains(query) |
        df["search_artist"].str.contains(query)
    )

    data = (
        df[mask]
        .sort_values("track_popularity", ascending=False)
        .head(50)
    )

    return jsonify(data.fillna("").to_dict(orient="records"))


@app.route("/filter")
def filter_songs():
    cat_type = request.args.get("type")
    value = request.args.get("value")

    data = (
        df[df[cat_type] == value]
        .sort_values("track_popularity", ascending=False)
        .head(100)
    )

    return jsonify(data.fillna("").to_dict(orient="records"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
