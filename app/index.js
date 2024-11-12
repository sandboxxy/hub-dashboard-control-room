module.exports = (app) => {
  app.on(['installation_repositories.added'], async context => {
    // Whenever a new repository is added, this will send a "registration"
    // repository dispatch to hubverse-org/hub-dashboard-control-room
    //
    // A workflow will then recieve this dispatch and proceed to build the
    // requested repositories
    const client_payload = {
      "newbies": context.repositories_added,
      "new": true,
      "message": "New Repository!"
    };
    const dispatch = {
      "owner": "hubverse-org",
      "repo": "hub-dashboard-control-room",
      "event_type": "registration",
      "client_payload": client_payload
    }
    return context.octokit.repos.createDispatchEvent(dispatch);
  })

}
