#!/usr/bin/env python3
import os
import glob
import re

def read_footer():
    """Read the footer content from footer.html"""
    try:
        with open('footer.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print("Warning: footer.html not found")
        return None

def update_html_file(file_path, footer_content):
    """Update an HTML file to include the footer"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file already has the footer
        if 'nav-block' in content and 'kdzu-block' in content and 'shadow-block' in content:
            print(f"Skipping {file_path} - already has footer")
            return False
        
        # Replace </body> with footer + </body>
        if '</body>' in content:
            new_content = content.replace('</body>', f'{footer_content}\n  </body>')
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"Updated {file_path}")
            return True
        else:
            print(f"Skipping {file_path} - no </body> tag found")
            return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main build function"""
    footer_content = read_footer()
    if not footer_content:
        return
    
    # Get all HTML files
    html_files = glob.glob("*.html") + glob.glob("*/*.html")
    
    updated_count = 0
    for file_path in html_files:
        if update_html_file(file_path, footer_content):
            updated_count += 1
    
    print(f"\nBuild complete! Updated {updated_count} files.")

if __name__ == "__main__":
    main() 