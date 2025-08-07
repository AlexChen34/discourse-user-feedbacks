# Discourse User Feedbacks Plugin

A modern Discourse plugin that allows users to give feedback and ratings to fellow community members.

## Features

- ⭐ 5-star rating system
- 📝 Optional text reviews
- 🔒 Prevents self-rating and duplicate ratings
- 📊 Average rating display on user profiles and posts
- 🛡️ Secure parameter handling and validation
- 📱 Mobile-responsive design

## Installation

1. Navigate to your Discourse installation directory
2. Add the plugin to your app.yml file:

```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - git clone https://github.com/Ahmedgagan/discourse-user-feedbacks.git
```

3. Rebuild your Discourse instance:

```bash
cd /var/discourse
./launcher rebuild app
```

## Configuration

After installation, enable the plugin in your admin settings:

1. Go to Admin → Settings → Plugins
2. Find "User Feedbacks" and enable it
3. Configure additional settings as needed:
   - `user_feedbacks_enabled`: Enable/disable the plugin
   - `user_feedbacks_display_average_ratings_beside_username_on_post`: Show ratings next to usernames
   - `user_feedbacks_hide_feedbacks_from_user`: Hide feedbacks from non-admin users

## Compatibility

- **Discourse Version**: 3.1.0+
- **Rails Version**: 7.0+
- **Ruby Version**: 3.0+

## Recent Updates (v2.0.0)

### JavaScript Modernization
- Migrated from legacy `.js.es6` files to modern `.js`
- Updated to use Glimmer components instead of legacy Ember components
- Replaced `discourseComputed` with modern getters and `@tracked` properties
- Updated API version requirements to latest standards

### Backend Improvements
- Enhanced parameter validation and security
- Added comprehensive model validations
- Improved error handling with proper HTTP status codes
- Added soft delete functionality
- Optimized database queries with scopes

### Security Enhancements
- Prevented self-feedback
- Added unique feedback constraints
- Secure parameter handling with strong parameters
- Input validation and sanitization

### Performance Optimizations
- Better database query patterns
- Reduced N+1 queries
- Improved pagination logic
- Optimized average rating calculations

## API Endpoints

- `GET /user_feedbacks.json` - List feedbacks
- `POST /user_feedbacks` - Create new feedback
- `PUT /user_feedbacks/:id` - Update feedback
- `DELETE /user_feedbacks/:id` - Delete feedback
- `GET /user_feedbacks/:id` - Show specific feedback

## Development

### Running Tests

```bash
bundle exec rspec test/models/user_feedback_test.rb
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/Ahmedgagan/discourse-user-feedbacks/issues) page.

For more information, please see: https://meta.discourse.org/t/discourse-user-feedback/219002
