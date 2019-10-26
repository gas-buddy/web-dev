CHANGELOG
=========

11.0.0
------
* Removed redux-logger from dependencies. Long live React Context.
* Remove fancy dancing around hot loader inclusion because it has near-zero production
time impact now. The new API will move to @gasbuddy/react. So where you used to have:

```
import { hot } from '@gasbuddy/web-dev/hot';
...
  if (process.env.NODE_ENV !== 'production') {
    return hot(module)(router);
  }
```

You should now have

```
import { hot } from '@gasbuddy/react';
...
  hot(router)
```

12.0.0
------
* Updated various deps including css-loader which has new module config format