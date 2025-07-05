#!/usr/bin/env python3
import glob
import os

FOOTER = '''      <div class="nav-block">
        <h3>Navigation</h3>
        <ul>
          <li class="nav-item"><a href="index.html">Home</a></li>
          <li class="nav-item"><a href="blog/index.html">Blog</a></li>
          <li class="nav-item"><a href="bio.html">Bio & CV</a></li>
          <li class="nav-item"><a href="privacy-policy.html">Privacy Policy</a></li>
        </ul>
      </div>

      <div class="kdzu-block">
        <h3>KDZU</h3>
        <ul>
          <li class="nav-item">
            DJing: <a href="http://futureghost.xyz">futureghost.xyz</a>
          </li>
          <li class="nav-item">
            extended reality:
            <a href="http://shimmeringtrashpile.com">shimmeringtrashpile.com</a>
          </li>
          <li class="nav-item">
            collectivity: <a href="http://kdzu.org">KDZU.org</a>
          </li>
          <li class="nav-item">
            mastodon:
            <a href="https://post.lurk.org/@shimmeringtrashpile"
              >@shimmeringtrashpile@post.lurk.org</a
            >
          </li>
        </ul>
      </div>

      <div class="shadow-block">
        <h3>Shadow Mountain</h3>
        <ul>
          <li class="nav-item">
            email:
            <a href="mailto:rob@shadowmountain.club"
              >rob@shadowmountain.club</a
            >
          </li>
          <li class="nav-item">
            instagram:
            <a href="http://instagram.com/shadowmountainclub"
              >instagram.com/shadowmountainclub</a
            >
          </li>
        </ul>
      </div>\n'''

def needs_footer(content):
    return ("nav-block" not in content) and ("kdzu-block" not in content) and ("shadow-block" not in content)

def main():
    html_files = glob.glob("*.html") + glob.glob("*/*.html")
    updated = 0
    for path in html_files:
        with open(path, encoding="utf-8") as f:
            content = f.read()
        if needs_footer(content):
            new_content = content.replace("</body>", f"{FOOTER}\n</body>")
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Added footer to: {path}")
            updated += 1
    print(f"\nAdded footer to {updated} files.")

if __name__ == "__main__":
    main() 