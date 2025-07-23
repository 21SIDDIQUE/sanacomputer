import base64

# Update the file name here
TTF_FILE = "Roboto-Regular.ttf"
JS_FILE = "Roboto-Regular.js"

def convert_ttf_to_js(ttf_file, js_file):
    with open(ttf_file, "rb") as font_file:
        font_data = font_file.read()
        base64_data = base64.b64encode(font_data).decode("utf-8")

    js_content = f"""
    // Roboto-Regular Font
    const RobotoFont = "{base64_data}";
    export default RobotoFont;
    """
    with open(js_file, "w") as js_output:
        js_output.write(js_content)

    print(f"Font converted successfully to {js_file}")

convert_ttf_to_js(TTF_FILE, JS_FILE)
