<script>
    import {user, vehicles} from "../stores";
    import {doGet, doPost} from "../../services/api";
    import {Route, SetUser} from "../routes.js";
    import {blank} from '../../helpers/helper'
    import * as alertify from 'alertifyjs'

    import Home from "./Home.svelte";

    export let page;
    export let params;
    export let isLoading;

    let username = 'admin@admin.com';
    let password = 'admin';
    let results;
    let invalidInput = false;
    import {TextInput} from "carbon-components-svelte";
    import {Button, ButtonSet, InlineLoading} from "carbon-components-svelte";
    import Login from "carbon-icons-svelte/lib/Login.svelte";

    const descriptionMap = {
        active: "Submitting...",
        finished: "Success",
        inactive: "Cancelling...",
    };

    const stateMap = {
        active: "finished",
        inactive: "dormant",
        finished: "dormant",
    };
    //v16.13.2
    //8.14.0
    let state = "dormant";


    // let progress = {};
    // let poller;
    //
    // const setupPoller = (id) => {
    //     if (poller) {
    //         clearInterval(poller);
    //     }
    //     poller = setInterval(doPoll(id), 2000)
    // }
    //
    // const doPoll = (id) => async () => {
    //     console.log(`polling ${id}`)
    //     progress[id] = await new Promise(resolve => setTimeout(async () => {
    //             const response = await window.api.getMemberCardUid('post_data')
    //             console.log('-----dari login-------')
    //             console.log(response)
    //         resolve((progress[id] || 0) + 1)
    //     }, 500))
    // }
    //
    // $: setupPoller(1);
    const responseHandling = async (response, message = '') => {
        let exclude = [200, 201, 202]
        console.log('body', response)
        if (exclude.indexOf(response.status_code) > -1) {
            // alertify.success(response.url)
            alertify.success(message)
            return response.data
        } else {
            if (!blank(response)) {
                alertify.error(response.message)
            }
            return null
        }
    }


    async function handleSubmit() {
        state = 'active';
        let login = await window.api.login({
            'email': username,
            'password': password
        })

        let vehiclesData = await window.api.get('/api/vehicles')
        login = await responseHandling(login, 'login')
        vehiclesData = await responseHandling(vehiclesData, 'vehicles')

        if (!blank(login)) {
            login['auth'] = true
            $user = SetUser('home', login)
            $vehicles = vehiclesData
            params = login
            page = Route('home', $user)
            state = 'finished';
        } else {
            state = 'finished';
            state = 'dormant';
        }
    }


</script>

<div class="login-form">

    <form

            on:submit|preventDefault={handleSubmit}
    >
        <h1>Log in </h1>
        <TextInput
                bind:value={username}
                type="text"
                name="username"
                invalid={!blank(results) && !blank(results?.['errors']?.['email'])}
                invalidText={results?.['errors']?.['email']?.[0]}
                labelText="USERNAME"
                placeholder="Enter user name..."
        />

        <br/>
        <TextInput
                bind:value={password}
                type="password"
                name="password"
                invalid={!blank(results) && !blank(results?.['errors']?.['password'])}
                invalidText={results?.['errors']?.['password']?.[0]}
                labelText="PASSWORD"
                placeholder="Enter user name..."
        />
        <div class="submit-btn">
            <ButtonSet>
                {#if state !== "dormant"}
                    <InlineLoading status={state} description={descriptionMap[state]}/>
                {:else}
                    <Button type="submit" icon={Login}>Submit</Button>
                {/if}
            </ButtonSet>
        </div>

    </form>
</div>


<style>

    h1 {
        margin-bottom: 20px;
        text-align: left;
    }

    .login-form {
        padding: 20px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
        /*background-color: green;*/
    }

    .submit-btn {
        text-align: end;
        /*text-align: center;*/
        margin: 20px 0px;
        /*position: absolute;*/
        /*top: 50%;*/
        /*left: 50%;*/
        /*-ms-transform: translate(50%, 0%);*/
        /*transform: translate(20%, 0%);*/

    }


</style>

