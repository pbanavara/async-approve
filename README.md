async-approve
=============

An ansychronous approval system based on tornado and websockets

We have several scenarios where in approvals have to be obtained for transactions. This is an attempt to build a fast asynchronous system for obtanining such approvals.

This is the premise.

The client sends a JSON object with an indication that an approval is required, obviously by a certain String field in the JSON object, lets say 'To Be Approved'. The server then transmits this to all approvers using websockets. The approvers reset this field in the JSON object to a string 'approved'. The JSON then gets sent back to the client and the client proceeds to manipulate the JSON and this process continues. 

Main datastructures:

Set of approvers
Set of creators
JSON object that gets passed between creators and approvers.
