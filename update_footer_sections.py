#!/usr/bin/env python3
"""
Script to wrap footer blocks in a <footer> section for all HTML files and fix extra closing </div> tags after the footer.
"""

import os
import re
from pathlib import Path

def update_footer_sections(file_path):
    """Update footer blocks to be wrapped in a footer section and fix extra closing divs."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match the three footer blocks
        footer_pattern = r'(\s*<div class="nav-block">.*?</div>\s*<div class="kdzu-block">.*?</div>\s*<div class="shadow-block">.*?</div>\s*)'
        
        # Wrap footer blocks if not already wrapped
        if re.search(footer_pattern, content, re.DOTALL) and '<footer>' not in content:
            new_footer = r'      <footer>\n\1      </footer>'
            content = re.sub(footer_pattern, new_footer, content, flags=re.DOTALL)
        
        # Remove extra closing divs after </footer> (should be only one </div> for .page.grid)
        # Find the last </footer> and everything up to </body>
        content = re.sub(r'(</footer>)(\s*</div>)+', r'\1\n    </div>', content, flags=re.DOTALL)
        
        # Remove any remaining duplicate </div> before </body>
        content = re.sub(r'(</div>\s*){2,}</body>', r'</div>\n</body>', content, flags=re.DOTALL)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all HTML files."""
    current_dir = Path('.')
    html_files = list(current_dir.glob('*.html'))
    
    updated_count = 0
    total_files = len(html_files)
    
    print(f"Found {total_files} HTML files to process...")
    
    for html_file in html_files:
        if update_footer_sections(html_file):
            print(f"Updated: {html_file}")
            updated_count += 1
        else:
            print(f"No changes needed: {html_file}")
    
    print(f"\nSummary: Updated {updated_count} out of {total_files} files")

if __name__ == "__main__":
    main() 