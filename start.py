import subprocess
import threading
import signal
import sys
import os

# Commands and working directories for backend (Django) and frontend (Next.js)
BACKEND_COMMAND = ["python", "manage.py", "runserver"]
BACKEND_DIR = "django-backend"  # Path to the directory with manage.py

FRONTEND_COMMAND = ["npm", "run", "dev"]
FRONTEND_DIR = "nextjs-front/my-app"  # Path to the directory for Next.js

# Function to run a subprocess and capture its output
def run_process(command, name, cwd):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=cwd)
    print(f"{name} started with PID: {process.pid}")

    # Output the process logs with a name prefix
    def log_output(stream, prefix):
        for line in iter(stream.readline, ""):
            print(f"[{prefix}] {line}", end="")
        stream.close()

    # Thread to print stdout and stderr separately
    threading.Thread(target=log_output, args=(process.stdout, name), daemon=True).start()
    threading.Thread(target=log_output, args=(process.stderr, name), daemon=True).start()

    return process

# Function to handle cleanup
def cleanup(processes):
    print("\nShutting down servers...")
    for process in processes:
        if process.poll() is None:  # Check if the process is still running
            process.terminate()
    print("All servers have been stopped.")

# Main function to start both servers and handle shutdown on Ctrl+C
def main():
    backend_process = run_process(BACKEND_COMMAND, "Backend", BACKEND_DIR)
    frontend_process = run_process(FRONTEND_COMMAND, "Frontend", FRONTEND_DIR)

    # List of all processes
    processes = [backend_process, frontend_process]

    # Function to check if any process has crashed
    def monitor_processes():
        while True:
            for process in processes:
                if process.poll() is not None:  # Process has exited
                    print(f"\n[{process.args[0]}] has stopped unexpectedly. Shutting down both servers...")
                    cleanup(processes)
                    sys.exit(1)

    # Start the monitoring thread
    monitor_thread = threading.Thread(target=monitor_processes, daemon=True)
    monitor_thread.start()

    # Handle Ctrl+C gracefully
    try:
        # Wait indefinitely
        signal.pause()
    except KeyboardInterrupt:
        print("\nCtrl+C received.")
        cleanup(processes)

if __name__ == "__main__":
    main()
