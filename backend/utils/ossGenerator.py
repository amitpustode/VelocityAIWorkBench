# Node
# npm install -g license-checker
# or execute
# sudo npm install -g license-checker
# license-checker --json > oss-node-dependencies.json
# npm uninstall -g license-checker
# sudo npm uninstall -g license-checker

# Python
# pip install pip-licenses
# pip-licenses --format=json > oss-python-dependencies.json
# pip uninstall pip-licenses

# Move oss-node-dependencies.json and oss-python-dependencies.json from SRC & python folder to python/utils folder.
# ensure both oss-node-dependencies.json and oss-python-dependencies.json are at same level as this file

# python ossGenerator.py
# Run in Interactive Mode ossGenerator.py

# Open Source Checker Issues by IT: https://docs.google.com/document/d/1ZbJVltHTScSvKJFWtbzg-Ki_zyPO5oAyaStIXPZ8-DM/edit

import json

# Function to generate OSS table for Node.js dependencies
def generate_markdown_for_oss(data, project_name):
    markdown = f"<details>\n<summary>{project_name} Dependencies</summary>\n\n"
    markdown += "| Package Name | Version | License |\n"
    markdown += "|--------------|---------|---------|\n"

    for package, details in data.items():
        version = details.get('version', 'N/A')
        license_type = details.get('licenses', 'N/A')
        markdown += f"| {package} | {version} | {license_type} |\n"

    markdown += "\n</details>\n"
    return markdown

# Function to generate OSS table for Python dependencies
def generate_markdown_for_python_oss(data, project_name):
    markdown = f"<details>\n<summary>{project_name} Dependencies</summary>\n\n"
    markdown += "| Package Name | Version | License |\n"
    markdown += "|--------------|---------|---------|\n"

    for entry in data:
        package = entry['Name']
        version = entry['Version']
        license_type = entry['License']
        markdown += f"| {package} | {version} | {license_type} |\n"

    markdown += "\n</details>\n"
    return markdown

# Function to generate a distinct Distinct License collapsible table
def generate_distinct_license(node_data, python_data):
    distinct_licenses = {}

    # Collect licenses from Node.js dependencies
    for package, details in node_data.items():
        license_type = details.get('licenses', 'N/A')
        if license_type not in distinct_licenses:
            distinct_licenses[license_type] = "Node.js"

    # Collect licenses from Python dependencies
    for entry in python_data:
        license_type = entry['License']
        if license_type not in distinct_licenses:
            distinct_licenses[license_type] = "Python"

    # Generate Markdown for Distinct License
    markdown = "<details>\n<summary>Distinct License</summary>\n\n"
    markdown += "| Source  | License Name    |\n"
    markdown += "|---------|-----------------|\n"

    for license_name, source in distinct_licenses.items():
        markdown += f"| {source} | {license_name} |\n"

    markdown += "\n</details>\n"
    return markdown

# Load Node.js OSS data
with open('oss-node-dependencies.json', 'r') as node_file:
    node_oss_data = json.load(node_file)

# Load Python OSS data
with open('oss-python-dependencies.json', 'r') as python_file:
    python_oss_data = json.load(python_file)

# Generate Markdown for Node.js and Python dependencies
node_markdown = generate_markdown_for_oss(node_oss_data, "Node.js")
python_markdown = generate_markdown_for_python_oss(python_oss_data, "Python")

# Generate Distinct License Markdown
license_summary_markdown = generate_distinct_license(node_oss_data, python_oss_data)

# Combine and save the markdown to a file
with open('oss-report.md', 'w') as markdown_file:
    markdown_file.write("# OSS Dependency Report\n\n")
    markdown_file.write(node_markdown)
    markdown_file.write(python_markdown)
    markdown_file.write(license_summary_markdown)

print("OSS Markdown report generated: oss-report.md")