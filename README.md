# AWS-Stats

This module is an express router that exposes an api to get cloudmetrics stats from AWS.  

### Including in backend

The module just exposes an express router - so you just need to use it for a specific route. For example:  

```
const app = require('express')();

app.use('/foo', require('aws-stats'));

app.listen(8080);
```

**AWS Credentials**

You'll need to have some AWS credentials set up on the host machine for this to work. See [here](http://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html) for more details.

### The API

Route | Function | Parameters
--- | --- |  ---
**/list** | lists all valid regions and namespaces |
**/list/[NAMESPACE]** | lists all available metrics for NAMESPACE | *region*
**/stat/[NAMESPACE]/[METRIC]** | gets stats for metric in namespace | *region*, *age*, *regex*

**Querystrings**

All querystring parameters are optional.

Parameter | Function | Default
--- | --- | ---
**region** | a valid region | eu-west-2
**age** | how long ago (in ms) to gather stats from | 3600000 (1 hour)
**regex** | a regular expression for the resources to get stats for. The result will be the average for all matched resources | null (all resources)
