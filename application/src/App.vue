<template>
  <div id="app">
    <div id="nav" class="bg-info text-left">
      <h1>Shop POC</h1>
      <b-row>
        <b-col>
          <router-link to="/">Home</router-link> |
          <router-link to="/account">My Account</router-link> |
          <router-link to="/cart">My shopping cart</router-link> |
          <router-link to="/order">Order</router-link>
        </b-col>
        <b-col>User email: (for authorizer) <b-input v-model="apiToken" /></b-col>
      </b-row>

    </div>
    <div class="p-4 bg-light">
      <router-view :api-token="apiToken" api-url="http://localhost:82" />
    </div>

  </div>
</template>

<script>

export default {
  name: 'Home',
  data() {
    return {
      apiToken: 'kbedra@tbscg.com',
    }
  },
  watch: {

  },
  computed: {

  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #ddffdd;
}
</style>
