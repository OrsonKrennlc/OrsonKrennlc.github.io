import tkinter as tk
from tkinter import ttk, messagebox

# --- Optimized Core Algorithm ---
# The original code's panning mechanism effectively shifts the mapping values.
# Mathematically, each rotor operation performs a modular arithmetic shift
# that advances for every character evaluated. This reduces O(N * 26) 
# dict recreations to simple O(N) integer arithmetic.

def optimized_coding(key, text):
    try:
        s1, s2, s3 = int(key[0]), int(key[1]), int(key[2])
    except (ValueError, IndexError):
        raise ValueError("Key must be exactly 3 digits.")
    
    y = ""
    for char in text.lower():
        if 'a' <= char <= 'z':
            val = ord(char) - 97
            m = (val - s1) % 26
            s1 += 1
            m = (m - s2) % 26
            s2 += 1
            m = (m - s3) % 26
            s3 += 1
            y += chr(m + 97)
        else:
            y += char
    return y

def optimized_decoding(key, text):
    try:
        s1, s2, s3 = int(key[0]), int(key[1]), int(key[2])
    except (ValueError, IndexError):
        raise ValueError("Key must be exactly 3 digits.")
        
    y = ""
    for char in text.lower():
        if 'a' <= char <= 'z':
            val = ord(char) - 97
            m = (val + s3) % 26
            s3 += 1
            m = (m + s2) % 26
            s2 += 1
            m = (m + s1) % 26
            s1 += 1
            y += chr(m + 97)
        else:
            y += char
    return y

# Backward compatibility wrappers for older external dependencies if they exist
def coding(x):
    try:
        z = x[0:3]
        text = x[4:]
        return z + ' ' + optimized_coding(z, text)
    except Exception:
        return ""

def decoding(x):
    try:
        z = x[0:3]
        text = x[4:]
        return z + ' ' + optimized_decoding(z, text)
    except Exception:
        return ""

# --- Modern GUI Implementation ---
class EnigmaApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Enigma-like Encryptor")
        self.geometry("640x500")
        self.configure(padx=20, pady=20)
        self.eval('tk::PlaceWindow . center')
        
        # Determine theme and apply basic styles
        style = ttk.Style(self)
        available_themes = style.theme_names()
        if 'clam' in available_themes:
            style.theme_use('clam')
        elif 'xpnative' in available_themes:
            style.theme_use('xpnative')
            
        style.configure("TButton", font=("Segoe UI", 10, "bold"), padding=5)
        style.configure("TLabel", font=("Segoe UI", 10))
        style.configure("TLabelframe.Label", font=("Segoe UI", 10, "bold"))
        
        # Title
        title_lbl = ttk.Label(self, text="Enigma Machine Console", font=("Segoe UI", 16, "bold"))
        title_lbl.pack(pady=(0, 15))

        # Key Frame
        key_frame = ttk.Frame(self)
        key_frame.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Label(key_frame, text="3-Digit Key (Rotors):").pack(side=tk.LEFT)
        self.key_var = tk.StringVar(value="123")
        self.key_entry = ttk.Entry(key_frame, textvariable=self.key_var, width=8, font=("Segoe UI", 12), justify=tk.CENTER)
        self.key_entry.pack(side=tk.LEFT, padx=10)
        
        # Input Frame
        input_frame = ttk.LabelFrame(self, text="Input Message", padding=10)
        input_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
        
        self.input_text = tk.Text(input_frame, height=5, font=("Consolas", 11), wrap=tk.WORD, undo=True)
        self.input_text.pack(fill=tk.BOTH, expand=True)
        
        # Buttons Frame
        btn_frame = ttk.Frame(self)
        btn_frame.pack(fill=tk.X, pady=(0, 15))
        
        self.btn_enc = ttk.Button(btn_frame, text="Encrypt \u2193", command=self.do_encrypt)
        self.btn_enc.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(0, 5))
        
        self.btn_dec = ttk.Button(btn_frame, text="Decrypt \u2193", command=self.do_decrypt)
        self.btn_dec.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(5, 0))
        
        self.btn_clear = ttk.Button(btn_frame, text="Clear", command=self.do_clear)
        self.btn_clear.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(5, 0))
        
        # Output Frame
        output_frame = ttk.LabelFrame(self, text="Output Result (Auto-copied to clipboard)", padding=10)
        output_frame.pack(fill=tk.BOTH, expand=True)
        
        self.output_text = tk.Text(output_frame, height=5, font=("Consolas", 11), wrap=tk.WORD, bg="#f4f4f4")
        self.output_text.pack(fill=tk.BOTH, expand=True)
        self.output_text.config(state=tk.DISABLED)

    def do_encrypt(self):
        key = self.key_var.get().strip()
        inp = self.input_text.get("1.0", tk.END).strip()
        
        # If the user included the key in input (e.g. "123 hello"), extract it cleanly
        if len(inp) >= 4 and inp[:3].isdigit() and inp[3] == ' ':
            key = inp[:3]
            self.key_var.set(key)
            inp = inp[4:]
            self.input_text.delete("1.0", tk.END)
            self.input_text.insert(tk.END, inp)
            
        if len(key) != 3 or not key.isdigit():
            messagebox.showerror("Invalid Key", "Please provide exactly 3 digits for the key (e.g., 123).")
            return
            
        if not inp:
            return
            
        try:
            result = optimized_coding(key, inp)
            final_output = f"{key} {result}"
            
            self.output_text.config(state=tk.NORMAL)
            self.output_text.delete("1.0", tk.END)
            self.output_text.insert(tk.END, final_output)
            self.output_text.config(state=tk.DISABLED)
            
            self.clipboard_clear()
            self.clipboard_append(final_output)
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {e}")

    def do_decrypt(self):
        inp = self.input_text.get("1.0", tk.END).strip()
        key = self.key_var.get().strip()
        
        # Auto-extract key if user pastes full encrypted string
        if len(inp) >= 4 and inp[:3].isdigit() and inp[3] == ' ':
            key = inp[:3]
            self.key_var.set(key)
            inp = inp[4:]
            self.input_text.delete("1.0", tk.END)
            self.input_text.insert(tk.END, inp)
            
        if len(key) != 3 or not key.isdigit():
            messagebox.showerror("Invalid Key", "Please provide exactly 3 digits for the key (e.g., 123).")
            return
            
        if not inp:
            return
            
        try:
            result = optimized_decoding(key, inp)
            final_output = f"{result}"
            
            self.output_text.config(state=tk.NORMAL)
            self.output_text.delete("1.0", tk.END)
            self.output_text.insert(tk.END, final_output)
            self.output_text.config(state=tk.DISABLED)
            
            self.clipboard_clear()
            self.clipboard_append(final_output)
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {e}")

    def do_clear(self):
        self.input_text.delete("1.0", tk.END)
        self.output_text.config(state=tk.NORMAL)
        self.output_text.delete("1.0", tk.END)
        self.output_text.config(state=tk.DISABLED)

if __name__ == "__main__":
    app = EnigmaApp()
    app.mainloop()