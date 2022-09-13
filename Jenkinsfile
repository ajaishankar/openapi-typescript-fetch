@Library("plextools") import tv.plex.PlexTools

def tools = new PlexTools(this)

timestamps {
  node('plex-linux-x86_64') {
    tools.docker("plex/build-cloud:latest") {
      stage('Checkout') {
        checkout(tools.checkout_obj())
      }

      stage('Install node modules') {
        tools.yarn_install()
      }

      if (tools.get_branch_name() == 'main') {
        stage('Deploying…') {
          tools.publish_node_package()
        }
      }
    }
  }
}