from app import create_app

app = create_app()

if __name__ == "__main__":
    # Local dev only. Production uses gunicorn (see Procfile / railway.toml).
    app.run(host="0.0.0.0", port=8000, debug=True)
