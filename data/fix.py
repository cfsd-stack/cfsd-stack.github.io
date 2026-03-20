import json

# Load and clean the JSON
with open('courses.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Strip spaces from all keys and string values
def clean(obj):
    if isinstance(obj, dict):
        return {k.strip(): clean(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean(item) for item in obj]
    elif isinstance(obj, str):
        return obj.strip()
    return obj

cleaned = clean(data)

# Save fixed JSON
with open('courses.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, indent=2, ensure_ascii=False)

print("✅ courses.json fixed!")