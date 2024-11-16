module.exports = (app) => {

  app.on(['issues.opened', 'issues.closed', 'issues.reopened'], async context => {
    const client_payload = {
      "newbies": [{"owner":"zkamvar", "name":"test-hub-dashboard"}],
      "new": true,
      "message": "New Repository!"
    };
    
    // 2024-11-14
    // I have determined that the token created for any given webhook event is specific to the
    // repository or org that initiates the webhook. 
    // 
    // Because I want to trigger a workflow on one specific repository, I need to generate
    // a token specifically for that installation on that repository. I grabbed the installation
    // ID from a previous error and restricted it to the one repository I wanted to trigger.
    //
    // Unfortunately, I continue to get 402 error codes. 
    var tkn = await context.octokit.rest.apps.createInstallationAccessToken({
      "installation_id": 57209927,
      "repositories": ["hub-dashboard-control-room"]
    })
    
    const toke = tkn.data.token
    tkn.data.token = "lol"
    app.log(tkn)
    
    
    const dispatch = {
      "owner": "sandboxxy",
      "repo": "hub-dashboard-control-room",
      "event_type": "registration",
      "client_payload": client_payload,
      // The octokit api apparently merges these values in. I know because I modified the
      // user-agent to be "me" and it showed up in the error response. 
      "headers": {
        "authorization": `token ${toke}`
      }
    }
    app.log("A new repository was added")
    app.log(client_payload)
    return context.octokit.repos.createDispatchEvent(dispatch);
  })
  app.on(['installation_repositories.removed'], async context => {
    // Whenever a new repository is added, this will send a "registration"
    // repository dispatch to hubverse-org/hub-dashboard-control-room
    //
    // A workflow will then recieve this dispatch and proceed to build the
    // requested repositories
    const client_payload = {
      "newbies": context.payload.repositories_removed.map((r) => r.full_name),
      "new": true,
      "message": "Bad Repository!"
    };
    app.log(`A new repository was removed ${client_payload.newbies}`);
  })
  app.on(['installation_repositories.added'], async context => {
    // Whenever a new repository is added, this will send a "registration"
    // repository dispatch to hubverse-org/hub-dashboard-control-room
    //
    // A workflow will then recieve this dispatch and proceed to build the
    // requested repositories
    const owner = context.payload.installation.account.login;
    const client_payload = {
      "newbies": context.payload.repositories_added.map((r) => {
         return({"owner": owner, "name": r.name})
      }),
      "new": true,
      "message": "New Repository!"
    };
    const dispatch = {
      "owner": "sandboxxy ",
      "repo": "hub-dashboard-control-room",
      "event_type": "registration",
      "client_payload": client_payload
    }
    app.log(`A new repository was added ${client_payload.newbies.owner}/${client_payload.newbies.name}`);
    return context.octokit.repos.createDispatchEvent(dispatch);
  })
}
