# Rob Ray - Personal Website

A static website showcasing art projects, collaborations, and creative work. Built with HTML, CSS, and JavaScript.

## Project Structure

```
robraynet/
├── index.html                 # Main homepage
├── bio.html                   # Bio & CV page
├── privacy-policy.html        # Privacy policy page
├── styles.css                 # Main stylesheet
├── styles-project.css         # Project page styles
├── styles-detail.css          # Detail page styles
├── styles-privacy-policy.css  # Privacy/Bio page styles
├── footer.html                # Shared footer component
├── build_site.py              # Build script for footer inclusion
├── include-footer.js          # JavaScript footer include (alternative)
├── images/                    # Image assets
├── blog/                      # Blog directory
└── [project-pages]/           # Individual project pages
```

## Build Process

### Prerequisites

- Python 3.6+
- Git
- MinIO Client (mc) for deployment

### Build Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd robraynet
   ```

2. **Make changes to shared components**
   - Edit `footer.html` to update footer content across all pages
   - Edit CSS files for styling changes
   - Edit individual HTML files for page-specific content

3. **Run the build script**
   ```bash
   python3 build_site.py
   ```
   This script will:
   - Read the footer content from `footer.html`
   - Automatically include the footer in all HTML files that don't already have it
   - Skip files that already contain the footer blocks
   - Report which files were updated

4. **Review changes**
   ```bash
   git status
   git diff
   ```

5. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Update footer and content"
   git push origin main
   ```

## Deployment

### Prerequisites

- MinIO Client (mc) installed and configured
- Access to Cloudflare R2 bucket

### Deployment Steps

1. **Configure MinIO Client** (if not already done)
   ```bash
   mc alias set myr2 <endpoint> <access-key> <secret-key>
   ```

2. **Deploy to R2**
   ```bash
   mc mirror . myr2/your-bucket-name --exclude ".git/*" --exclude "*.pyc" --exclude "__pycache__/*"
   ```

   Or for a specific directory:
   ```bash
   mc mirror ./public myr2/your-bucket-name --exclude ".git/*"
   ```

3. **Verify deployment**
   - Check your website URL
   - Verify footer appears on all pages
   - Test navigation links

## Development Workflow

### Adding New Pages

1. Create new HTML file
2. Use existing page structure as template
3. Run build script to include footer:
   ```bash
   python3 build_site.py
   ```

### Updating Footer

1. Edit `footer.html`
2. Run build script:
   ```bash
   python3 build_site.py
   ```
3. Commit and deploy

### Updating Styles

1. Edit appropriate CSS file:
   - `styles.css` - Main site styles
   - `styles-project.css` - Project page styles
   - `styles-detail.css` - Detail page styles
   - `styles-privacy-policy.css` - Privacy/Bio page styles
2. Commit and deploy

## Footer System

The site uses a shared footer component system:

- **`footer.html`** - Contains the three footer blocks (nav-block, kdzu-block, shadow-block)
- **`build_site.py`** - Automatically includes footer in all HTML files
- **CSS Grid** - Footer blocks are positioned using CSS Grid areas

### Footer Structure

```html
<div class="nav-block">
  <!-- Navigation links -->
</div>

<div class="kdzu-block">
  <!-- KDZU-related links -->
</div>

<div class="shadow-block">
  <!-- Shadow Mountain links -->
</div>
```

## CSS Architecture

- **Responsive Grid Layout** - Uses CSS Grid with media queries for different screen sizes
- **Component-based Styling** - Separate CSS files for different page types
- **Consistent Typography** - Inter font family with consistent sizing and spacing

## Browser Support

- Modern browsers with CSS Grid support
- Responsive design for mobile, tablet, and desktop
- Graceful degradation for older browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run build script
5. Test locally
6. Submit pull request

## License

[Your license here]

## Contact

- Website: [your-website-url]
- Email: rob@shadowmountain.club
- GitHub: [your-github-username] 