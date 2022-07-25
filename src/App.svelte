
<script>
    // export let name;
    // let response;
    // let payload;
    //
    let results;
    let isLoading = false;
    // let operatorId = '341'
    // let recipientPhone = {
    // 	'countryCode' : 'NG',
    // 	'number' : ''
    // }
    // let amount = ''
    // let customIdentifier = ''
    import {doPost, doGet} from "../services/api";
    // // console.log(process.env.NODE_ENV)
    // // console.log(access_token)
    // console.log(process.env.ACCESS_TOKEN)
    // function handleClick(payload){
    // 	results = doPost(payload)
    // }
    import {user,vehicles} from "./stores";
    import {Route} from "./routes.js";

    let params;
    let page = Route('home', $user)

    function setUser() {
        isLoading = true;
        results = doGet('/api/vehicles')
            .then(function (response) {
                console.log(response)
                $vehicles = response;
                console.log($vehicles)
                isLoading = false;
            })
    }
</script>


<header>
    <nav>
        <a href="#" on:click={()=>{Route('home',$user)}}>Home</a>
        <a href="#" on:click={()=>{Route('login', $user)}}>Login</a>
        <a href="#" on:click={setUser}>set user</a>
        <!--		<a href="/private">Secret Page</a>-->
    </nav>
</header>

<main>
    {#if isLoading}
       <p>Loading....</p>
    {:else}
        <svelte:component this={page} {...params} bind:page bind:params bind:isLoading/>
    {/if}

<!--    <p>{page}</p>-->
</main>

<style>
    main,
    header {
        padding: 20px;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    nav a {
        margin-right: 10px;
        text-decoration: none;
    }
</style>

<!--<main>-->

<!--	<h1>Hellazoaas {name}!</h1>-->
<!--	<button on:click={ () => handleClick({'aaa' : "sdfsf"}) }> RECHARGE-->
<!--	</button>-->
<!--&lt;!&ndash;	<h1>Hellazoaas {accessToken}!</h1>&ndash;&gt;-->
<!--	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>-->
<!--</main>-->


<!--<style>-->
<!--	main {-->
<!--		text-align: center;-->
<!--		padding: 1em;-->
<!--		max-width: 240px;-->
<!--		margin: 0 auto;-->
<!--	}-->

<!--	h1 {-->
<!--		color: #ff3e00;-->
<!--		text-transform: uppercase;-->
<!--		font-size: 4em;-->
<!--		font-weight: 100;-->
<!--	}-->

<!--	@media (min-width: 640px) {-->
<!--		main {-->
<!--			max-width: none;-->
<!--		}-->
<!--	}-->
<!--</style>-->