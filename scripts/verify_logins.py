import requests, json

BASE = "http://localhost:3322"
accounts = [
    "test1@gmail.com",
    "test2@gmail.com",
    "admin@gmail.com",
    "test3@gmail.com",
]

for email in accounts:
    s = requests.Session()
    csrf = s.get(f"{BASE}/api/auth/csrf").json()["csrfToken"]
    r = s.post(
        f"{BASE}/api/auth/callback/credentials",
        data={"csrfToken": csrf, "email": email, "password": "123"},
        allow_redirects=False,
    )
    loc = r.headers.get("location", "")
    ok = r.status_code == 302 and "error" not in loc
    print(f"{email}: {'OK' if ok else 'FAIL'} (status={r.status_code}, redirect={loc})")
