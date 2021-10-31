# missedCalls
Google App Script that returns a list of calls missed by company phone numbers. 

It first converts an excel file from the phone service provider containing all the call data into a Google sheet. 
Then from the google sheet, it reads the data values in the column containing the incoming phone numbers.
An algorithm adds only the calls that went unaddressed to an array, and returns it.

This script was made to be implemented as part of a larger set of code, the array will be used to send follow-up
messages to unattended calls.

This script will not work as I have censored sensitive data!
