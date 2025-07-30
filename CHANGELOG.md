# Discourse User Feedbacks Plugin - 2025 Update

## Version 2.0.0 - Modernization Update

This update brings the Discourse User Feedbacks plugin up to modern standards for 2025, ensuring compatibility with the latest Discourse versions.

### Key Bug Fixes

1. **Fixed Ember.js Computed Property Override Error**
   - Resolved the error: "The <discourse@component:rating-input::ember362>#checkedOne computed property was just overridden"
   - Migrated from deprecated `@discourseComputed` decorators to modern `computed` functions
   - Updated all computed properties to use proper Ember.js syntax

### Major Improvements

1. **Frontend Modernization**
   - Updated `rating-input.js.es6` component to use modern Ember.js patterns
   - Replaced deprecated `@discourseComputed` with standard `computed` functions
   - Fixed action handling to use proper `actions` hash instead of decorators
   - Updated event handling in templates from `{{action}}` to `{{on "click" (action)}}`

2. **Controller Updates**
   - Modernized `user-feedbacks.js.es6` controller
   - Updated computed property syntax
   - Added safer property access with optional chaining (`?.`)

3. **Route Improvements**
   - Updated route to use direct property access instead of deprecated `.get()` method
   - Added safer property access patterns

4. **Plugin Configuration**
   - Updated plugin version to 2.0.0
   - Added minimum required Discourse version (3.3.0)
   - Updated API version requirement to 1.4.0
   - Improved plugin description

5. **Code Quality Improvements**
   - Fixed deprecated method usage throughout the codebase
   - Added proper I18n imports where needed
   - Improved error handling and safety checks

### Technical Changes

- **Ember.js Compatibility**: Updated to work with modern Ember.js versions used in Discourse 2025
- **API Version**: Bumped minimum API version to 1.4.0
- **Property Access**: Migrated from `.get()` method to direct property access
- **Event Handling**: Updated to use modern event handling patterns
- **Computed Properties**: Fixed all computed property definitions to prevent override warnings

### Compatibility

- **Discourse Version**: 3.3.0+
- **Plugin API**: 1.4.0+
- **Ember.js**: Compatible with modern Ember versions in Discourse

### Migration Notes

This update maintains backward compatibility for user data and settings. No database migrations are required. The plugin will continue to work with existing user feedback data.

### Installation

1. Update the plugin files in your Discourse installation
2. Restart your Discourse instance
3. The plugin will automatically work with the new modernized code

### Known Issues

None currently reported. If you encounter any issues, please report them on the plugin's GitHub repository.
