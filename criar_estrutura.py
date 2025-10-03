import os

# Estrutura de pastas que queremos criar
folders = [
    "src/assets/images",
    "src/assets/fonts",
    "src/components",
    "src/screens",
    "src/navigation",
    "src/services",
    "src/store",
    "src/hooks",
    "src/utils",
]

def create_structure(base_path="."):
    for folder in folders:
        path = os.path.join(base_path, folder)
        os.makedirs(path, exist_ok=True)
        print(f"📂 Criado: {path}")

if __name__ == "__main__":
    # Altere '.' para o caminho do seu projeto caso não seja na raiz
    create_structure(".")
