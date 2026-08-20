import requests, json

BASE = "http://localhost:3322"
s = requests.Session()

# Get CSRF token
csrf = s.get(f"{BASE}/api/auth/csrf").json()["csrfToken"]
print("CSRF:", csrf[:10], "...")

# Login via next-auth credentials
r = s.post(
    f"{BASE}/api/auth/callback/credentials",
    data={"csrfToken": csrf, "email": "test3@gmail.com", "password": "ManusTest@123"},
    allow_redirects=False,
)
print("Login:", r.status_code, r.headers.get("location"))

# Test chat conversations API
r2 = s.get(f"{BASE}/api/chat/conversations")
print("Chat API:", r2.status_code)
try:
    data = r2.json()
    convs = data.get("conversations", [])
    print("Conversations:", len(convs))
    for c in convs[:3]:
        print(" -", c.get("conversationKey"), "participants:", [(p.get("userId"), p.get("name"), "DELETED" if p.get("deleted") else "") for p in c.get("participants", [])])
except Exception as e:
    print("JSON error:", e, r2.text[:300])

# Test messages API if conversations exist
if convs:
    cid = convs[0]["_id"] if isinstance(convs[0].get("_id"), str) else str(convs[0].get("_id"))
    r3 = s.get(f"{BASE}/api/chat/conversations/{cid}/messages?limit=10")
    print("Messages API:", r3.status_code)
    try:
        md = r3.json()
        for m in md.get("messages", [])[:3]:
            print(" - msg by", m.get("senderName"), "senderDeleted:", m.get("senderDeleted"))
    except Exception as e:
        print("Msg JSON error:", e, r3.text[:200])
