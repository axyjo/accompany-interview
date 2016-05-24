require 'interface'

# A common namespace for all contact providers to live in. A contact provider
# must define at least two methods:
#  - get_photo(email): returns an image URL representing the user with the
#                       given email address
#  - get_profile(email): returns the profile for a user with the given email
#  - authed?: checks if the user is authorized to access this provider
module ContactProviders
  Interface = interface do
    required_methods :get_photo, :get_profile, :authed?
  end

  # This exception should be raised when we cannot find a user's profile..
  class NoProfileFound < StandardError
  end

  # This exception should be raised when the provider returns another error.
  class GenericContactError < StandardError
  end
end

require_relative 'contacts/gravatar.rb'
