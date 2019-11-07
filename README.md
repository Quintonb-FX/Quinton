# DNS Migration Tool
Migrate DNS Records to Azure using ARM templates.
We are in the process of moving 200 domains; and doing it manually could introduct errors. So this tool is to mitigate that.
Put your domain(s) in and see the json and the ARM json you would need to set up the infrastructure on Azure. After that just point your registry to [Azure DNS](https://docs.microsoft.com/en-us/azure/dns/dns-getstarted-portal).

## DevOps
[![Build Status](https://dev.azure.com/SPUD365/Azure/_apis/build/status/DNS%20Migration%20Tool?branchName=master)](https://dev.azure.com/SPUD365/Azure/_build/latest?definitionId=99&branchName=master)