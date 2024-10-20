import sys

path=["./build/index.html","./build/200.html"]
replaced=sys.argv[1]
default=sys.argv[2] if len(sys.argv)>2 else None



print("parameter1:",replaced)
print("parameter2:",default)
def doit(file_path:str):
    with open(file_path,encoding='utf-8') as f:
        content=f.read()
    if replaced.lower().startswith("http"):
        content=content.replace("/BASE_HREF/manifest.json",f"{default}manifest.json")
    with open(file_path,"w",encoding='utf-8') as f:
        f.write(content.replace("/BASE_HREF/",replaced))

for i in path:
    try:
        doit(i)
    except:
        pass