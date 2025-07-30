# Discourse User Feedbacks Plugin (2025 Updated)

This plugin allows community members to give star ratings and feedback to other users in your Discourse forum.

## Features

- ⭐ 5-star rating system with partial star support
- 📝 Optional text reviews
- 👤 User profile integration showing average ratings
- 🎨 Display ratings next to usernames in posts
- 🔒 Privacy controls for hiding/showing feedback
- 📱 Mobile-friendly interface

## Version 2.0.0 Updates (2025)

This version has been completely updated to work with modern Discourse versions:

### Bug Fixes
- ✅ Fixed Ember computed property deprecation warnings
- ✅ Replaced deprecated `@discourseComputed` with standard `computed` properties
- ✅ Updated event handling from `{{action}}` to `{{on "click"}}`
- ✅ Modernized JavaScript syntax and imports

### Improvements
- 🚀 Updated plugin API requirements to 1.4.0
- 🔧 Enhanced error handling and parameter validation
- 🛡️ Added security checks to prevent self-feedback
- 🚫 Prevents duplicate feedback from same user
- 📊 Improved database queries for better performance

### Compatibility
- 📋 Required Discourse version: 3.3.0+
- 🔌 Plugin API version: 1.4.0+

## Installation

1. Add the plugin to your `app.yml` file:
```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - git clone https://github.com/Ahmedgagan/discourse-user-feedbacks.git
```

2. Rebuild your container:
```bash
cd /var/docker
./launcher rebuild app
```

3. Enable the plugin in your admin settings.

## Configuration

The following site settings are available:

- `user_feedbacks_enabled` - Enable/disable the plugin
- `user_feedbacks_allow_reviews` - Allow text reviews along with ratings
- `user_feedbacks_display_average_ratings_on_user_card` - Show ratings on user cards
- `user_feedbacks_display_average_ratings_beside_username_on_post` - Show ratings next to usernames
- `user_feedbacks_display_average_ratings_on_profile` - Show ratings on user profiles
- `user_feedbacks_hide_feedbacks_from_user` - Hide feedback visibility from regular users

## Usage

1. Navigate to any user's profile
2. Click on the "Feedbacks" tab
3. Rate the user with 1-5 stars (supports partial ratings)
4. Optionally add a text review (if enabled)
5. Submit your feedback

Users can view their received feedback on their profile page, and average ratings will be displayed according to your site settings.

## Security Features

- Users cannot give feedback to themselves
- Users cannot give multiple feedbacks to the same person
- Admin controls for feedback visibility
- Input validation and sanitization

## Troubleshooting

If you encounter the error "computed property was just overridden", ensure you're using version 2.0.0 or later of this plugin, which fixes all Ember.js compatibility issues.

## Support

For support and bug reports, please visit the original plugin repository or create an issue on GitHub.

## License

This plugin is released under the same license as Discourse.

## Credits

- Original author: Ahmed Gagan
- 2025 modernization updates: Community contribution
