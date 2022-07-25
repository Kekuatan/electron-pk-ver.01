
<script>
    import {user, vehicles} from "../stores";
    import {doGet, doPost} from "../../services/api";
    import {Route, SetUser} from "../routes.js";
    import Home from "./Home.svelte";
    export let page;
    export let params;
    export let isLoading;
    let username = 'admin@admin.com';
    let password = 'admin';
    let results;

    function handleSubmit() {
        isLoading = true;
        results = doGet('/api/vehicles')
            .then(function (response) {
                console.log(response)
                $vehicles = response;
                console.log($vehicles)
            })

        results = doPost('/api/login',{
            'email': username,
            'password': password
        })
            .then(function (response) {
                console.log(response)
                response['auth'] = true
                $user = SetUser('home',response)
                params =  user
                page = Route('home',$user)
                isLoading = false;
            })
    }

    (async () => {
        const response = await window.api.login('post_data')
        console.log('-----dari login-------')
        console.log(response)
        console.log('--------------------')
    })();
</script>

<h1>Login Page </h1>
<form on:submit|preventDefault={handleSubmit}>
    <input
            bind:value={username}
            type="text"
            name="username"
            placeholder="Username"
    />
    <br />
    <input
            bind:value={password}
            type="password"
            name="password"
            placeholder="Password"
    />
    <br />
    <button type="submit">Login</button>
</form>
