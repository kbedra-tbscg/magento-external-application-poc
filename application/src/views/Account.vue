<template>
  <div class="about">
    <h1>My account page</h1>
    <div v-if="response">
      {{response}}
    </div>
    <div v-if="data.hasOwnProperty('firstname')">
      <h4><strong>First name:</strong> {{data.firstname}}</h4>
      <h4><strong>Last name:</strong> {{data.lastname}}</h4>
      <h4><strong>Email name:</strong> {{data.email}}</h4>
      <h4><strong>Date of birth:</strong> {{data.dob}}</h4>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: 'Account',
  props: ['apiToken','apiUrl'],
  data() {
    return {
      data: {},
      sending: false,
      response: '',

    }
  },
  watch: {

  },
  computed: {

  },
  mounted() {
    this.getMyAccount()
  },
  methods: {
    getMyAccount() {
      this.sending = true
      let _self = this
      axios({
        method: 'GET',
        url: this.apiUrl + '/customers/me',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

      }).then(function (response) {
        _self.data = response.data;
        _self.sending = false
      }).catch(function (error) {
        _self.sending = false
        if (error.response && error.response.data) {
          _self.response = error.response.data;
        } else if (error.response) {
          _self.response = error.response
        } else {
          _self.response = error
        }
      });
    }
  }
}
</script>