# Discourse User Feedback Plugin v1.0.0

A comprehensive user feedback system for Discourse that allows community members to rate each other with positive, neutral, or negative feedback.

## Features

### ✨ **Rating System**
- **3-Option Rating**: Positive (👍), Neutral (😐), or Negative (👎) feedback system
- **Daily Limits**: Each user can only rate another user once per day
- **Visual Display**: Ratings appear in user cards, profiles, and throughout the interface

### 👥 **User Experience**
- **Feedback Records**: Users can view their complete feedback history (given and received)
- **Intuitive Interface**: Simple 3-button rating interface with optional text reviews
- **Real-time Updates**: Instant feedback display across all user interface components

### 🔧 **Admin Controls**
- **Admin-Only Modifications**: Only administrators can modify existing ratings
- **Comprehensive Statistics**: Daily and weekly feedback analytics dashboard
- **Configurable Settings**: Customizable daily limits, trust level requirements, and display options

### 📊 **Statistics Dashboard**
- **Overall Statistics**: Total feedbacks, positive/neutral/negative breakdowns
- **Daily & Weekly Analytics**: Detailed activity tracking with visual charts
- **User Metrics**: Unique users giving/receiving feedback tracking
- **Visual Components**: Responsive stat cards with color-coded displays

## Installation

1. Clone this repository to your Discourse plugins directory:
```bash
cd /path/to/discourse/plugins
git clone https://github.com/AlexChen34/discourse-user-feedbacks.git
```

2. Rebuild your Discourse instance:
```bash
cd /path/to/discourse
./launcher rebuild app
```

3. Run the database migration to convert existing data (if upgrading):
```bash
cd /path/to/discourse
./launcher enter app
rails db:migrate
```

## Configuration

Visit your Discourse admin panel → Settings → Plugins → User Feedbacks to configure:

- **Enable/disable** the feedback system
- **Set daily rating limits** (default: 5 per day)
- **Configure minimum trust level** for giving feedback
- **Toggle display options** for user cards, profiles, etc.
- **Enable statistics dashboard** for admins

## Usage

### For Users
1. **Give Feedback**: Visit any user's profile or click their username
2. **Rate Users**: Choose positive, neutral, or negative with optional text review
3. **View History**: Access your feedback records through your user profile
4. **Daily Limits**: One rating per user per day to prevent spam

### For Admins
1. **Modify Ratings**: Admins can edit or delete any user feedback
2. **View Statistics**: Access comprehensive analytics at `/admin/plugins/user-feedbacks/stats`
3. **Monitor Activity**: Track daily/weekly feedback trends and user engagement

## Version History

### v1.0.0 (August 14, 2025)
- **Complete rewrite** from 5-star system to positive/neutral/negative
- **Added daily rating constraints** and spam prevention
- **Implemented admin-only modifications** with tracking
- **Created comprehensive statistics dashboard** with visual analytics
- **Updated all UI components** with modern 3-button interface
- **Added database migration** for seamless upgrade from previous versions
- **Enhanced localization support** for multiple languages
- **Responsive CSS design** for all screen sizes

## Technical Details

- **Backend**: Ruby on Rails with ActiveRecord models
- **Frontend**: Ember.js components with Handlebars templates
- **Database**: PostgreSQL with proper indexing and constraints
- **Styling**: SCSS with Discourse theme compatibility
- **Localization**: I18n support for client and server strings

## Support

For issues, feature requests, or contributions, please visit our [GitHub repository](https://github.com/AlexChen34/discourse-user-feedbacks).

Original concept from: https://meta.discourse.org/t/discourse-user-feedback/219002
