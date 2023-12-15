import subprocess

# Specify the path to your JavaScript file

def main(a):
    js_file = r"C:\Users\Administrator\Desktop\Google_My_Business\Google5b.js"

    # Run the JavaScript file using Node.js
    try:
        subprocess.run(["node", js_file, a], check=True,stderr=subprocess.STDOUT)
        return "Script Completed"
    except subprocess.CalledProcessError as e:
        print(f"Error running the JavaScript file: {e}")
        return e
    except FileNotFoundError:
        print("Node.js is not installed, or the JavaScript file path is incorrect.")
        return e

a = "best movers and packers california"

main(a)