/*
    limit api hits to one per minute per endpoint
    gets api request on endpoint
    if no data for that endpoint
      go to api
      cache response
      return resopnse
    if data for that endpoint
      check if older than 1 min
      if older than 1 min
        go to api
        cache response
        return response
    if under 1 min
      return cached response
*/