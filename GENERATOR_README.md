# Frostbyte Generator

## Overview
The **Frostbyte Generator** is an advanced admin panel and configuration tool for managing and generating customized versions of Frostbyte.html. It provides a comprehensive interface for modifying all aspects of Frostbyte without directly editing the source code.

## Features

### 🎨 Visual Configuration Interface
- **8 Configuration Tabs**: General, Buttons, Notes, Rules, Modals, DAE, Features, Advanced
- **Real-time Updates**: Changes are reflected immediately in the configuration
- **Form Validation**: Ensures all inputs are valid before generation

### 🔧 Core Capabilities

#### 1. General Settings
- Application version control
- Title and description customization
- Author information
- Meta tag configuration

#### 2. Button Management
- Add, edit, and delete custom buttons
- Configure button properties:
  - ID, label, icon
  - Action type (URL, function, modal)
  - Category and order
- Visual button list with search/filter

#### 3. Notes Configuration
- Customize notes format templates
- Configure placeholders (tech name, work order, systems, etc.)
- Pipe-separated format support
- EMS system integration

#### 4. Conditional Rules
- Create display rules for buttons/sections
- Condition-based UI modifications
- System-specific customizations

#### 5. Modal Management
- Configure built-in modals
- Add custom modal content
- Control modal behavior

#### 6. DAE Tool Templates
- Manage DAE (Digital Asset Expert) templates
- Add/edit/delete templates
- Template preview
- Store management templates

#### 7. Feature Toggles
8 major features can be enabled/disabled:
- ✅ War Room
- ✅ Database
- ✅ Dead Air Timer
- ✅ DAE Tool
- ✅ Notes System
- ✅ Quick Action Buttons
- ✅ Conditional Rules
- ✅ Format Settings

#### 8. Advanced Settings
- Warning threshold configuration
- Storage key customization
- Custom CSS injection
- Custom JavaScript injection

## How to Use

### 1. Setup
1. Place `FrostbyteGenerator.html` in the same directory as `Frostbyte.html`
2. Open `FrostbyteGenerator.html` in a web browser
3. The generator will automatically load `Frostbyte.html` as a template

### 2. Configuration
1. Navigate through the tabs to configure different aspects
2. Make changes in the forms (all changes are auto-saved to config)
3. Use the button management system to add/edit/remove buttons
4. Configure DAE templates for common store scenarios
5. Toggle features on/off as needed

### 3. Generation
1. Click **"Preview Changes"** to see your configuration in action
2. Click **"Generate Frostbyte"** to create the new file
3. Confirm the generation dialog
4. The new file will be downloaded as `Frostbyte_v{version}_Generated.html`

### 4. Save/Load Configuration
- **Save Configuration**: Export current config as JSON file for backup
- **Load Configuration**: Import previously saved JSON configuration
- Configuration files can be shared between team members

## Technical Details

### Configuration Object Structure
```javascript
{
    version: "2.0.0",
    title: "Frostbyte",
    description: "Support tool for Upstream Digital Assets",
    author: "morphon",
    buttons: [...],
    daeTemplates: {...},
    notesFormat: "...",
    displayRules: [...],
    features: {
        warRoom: true,
        database: true,
        deadAirTimer: true,
        daeTool: true,
        notes: true,
        quickButtons: true,
        conditionalRules: true,
        formatSettings: true
    },
    advanced: {
        warningThreshold: 300,
        storageKey: "frostbyte_data",
        customCSS: "",
        customJS: ""
    }
}
```

### Generation Process
1. **Load Template**: Reads `Frostbyte.html` using fetch API
2. **Parse Existing**: Extracts current configuration from template
3. **Apply Changes**: Uses regex replacements to update:
   - Version and metadata
   - DAE templates
   - Notes format
   - Warning thresholds
   - Storage keys
   - Custom CSS/JS
4. **Toggle Features**: Comments out disabled features
5. **Create File**: Generates blob and triggers download

### Custom Code Injection
- **Custom CSS**: Injected before `</style>` with marker comment
- **Custom JavaScript**: Injected before `</script></body>` with marker comment
- Markers allow re-generation without duplication

### Feature Toggling
Disabled features are wrapped in HTML comments:
```html
<!-- Feature Name Disabled by Generator -->
<!-- original code here -->
```

## Best Practices

### 1. Configuration Management
- Always save configuration after major changes
- Use descriptive filenames for config exports
- Keep backups of working configurations

### 2. Testing
- Use **Preview** before generating
- Test generated files thoroughly
- Keep original `Frostbyte.html` as backup

### 3. Custom Code
- Test custom CSS in browser dev tools first
- Validate custom JavaScript before injection
- Use comments in custom code for documentation

### 4. Version Control
- Increment version numbers for each generation
- Use semantic versioning (major.minor.patch)
- Document changes in version history

## Troubleshooting

### Generator Won't Load
- Ensure `Frostbyte.html` is in the same directory
- Check browser console for errors
- Verify file permissions

### Preview Not Working
- Check browser popup blocker settings
- Ensure JavaScript is enabled
- Try different browser

### Generation Fails
- Verify all required fields are filled
- Check custom CSS/JS for syntax errors
- Review browser console for detailed error messages

### Features Not Toggling
- Some features require specific code structure
- Check that feature exists in template
- Verify regex patterns match template structure

## Advanced Usage

### Custom CSS Examples
```css
/* Change primary color */
:root {
    --primary-color: #0066cc;
}

/* Custom button styles */
.custom-button {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}
```

### Custom JavaScript Examples
```javascript
/* Add custom initialization */
window.addEventListener('load', () => {
    console.log('Custom initialization complete');
});

/* Add custom functions */
function myCustomFunction() {
    // Your code here
}
```

## Support & Feedback
For issues, feature requests, or questions about the Frostbyte Generator, contact the development team.

## Version History
- **1.0.0** (Initial Release)
  - Complete admin panel interface
  - Full generation engine
  - Configuration import/export
  - Feature toggles
  - Custom code injection
  - Preview functionality

---

**Note**: This tool is designed for advanced users familiar with Frostbyte's structure. Always backup your files before generating new versions.
