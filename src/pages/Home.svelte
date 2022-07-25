<script>
    import {user, vehicles} from "../stores";
    import {doGet, doPost, doPostWithImage, CameraOut} from "../../services/api";
    import {Route, SetUser} from "../routes";


    const areaPosition = process.env.AREA_POSITION;
    export let page;
    export let params;
    export let isLoading;
    let results;
    let vehicle;
    let indexForm = 1;
    let barcode_no = '20220527154316PK';
    let plat_no = 'AB24325C';
    let img = 'blob:file:///571a74b9-2a85-45a1-9e9c-f4bbefebe559'

    function handleSubmit(index) {
        indexForm = index;
        if (indexForm === 4){
            isLoading = true;
            CameraOut()
                .then((response) => response.blob())
                .then((blob) => {
                    console.log(blob)
                    let reader  = new FileReader();
                    reader.onload =  function(e){
                        const file = new File([blob], barcode_no + ".jpeg", {
                            type: 'image/jpeg'
                        });
                        const formData = new FormData()
                        formData.append('picture_vehicle_out', file)
                        formData.append('barcode_no', barcode_no)
                        formData.append('area_position_out_id', areaPosition)
                            doPostWithImage('/api/ticket/out',formData, $user['access_token'])
                                .then(function (response) {
                                    results =  response;
                                }).catch((e)=>{
                                    console.log(e)
                                })
                    };
                    return URL.createObjectURL(blob)
                }).then((src) => {
                    img = src
                    isLoading = false;
                })
        }
    }

    function onKeyDown(e) {
        console.log(e.keyCode)
        let input = '';
        switch (e.keyCode) {
            case 27:
                indexForm = indexForm === 1 ? indexForm : indexForm - 1;
                break;
            case 13:
                indexForm += 1
                break;
        }
    }



</script>

<h1>Home  {$user['data']['name']}</h1>
<img class="avatar" src={img} alt="" />
{#if indexForm === 1}
    <form
            on:submit|preventDefault={() =>{handleSubmit(2)}}
            on:keydown={(e)=>{onKeyDown(e)}}>
        <input bind:value={plat_no}>
        <button type=submit>
            Submit
        </button>
    </form>
{:else if indexForm === 2}

    <form
            on:submit|preventDefault={() =>{handleSubmit(3)}}
            on:keydown={(e)=>{onKeyDown(e)}}>
        <select bind:value={vehicle}>
            {#each $vehicles as vehicle}
                <option value={vehicle['id']}>
                    {vehicle['name']}
                </option>
            {/each}
        </select>
        <button type=submit>
            Submit
        </button>
    </form>
{:else if indexForm === 3}

    <form
            on:submit|preventDefault={() =>{handleSubmit(4)}}
            on:keydown={(e)=>{onKeyDown(e)}}>
        <input bind:value={barcode_no}>
        <button type=submit>
            Submit
        </button>
    </form>
{:else}
    <div>
        <p> Gambar Pintu Masuk </p>
        <img class="avatar" src="{results['vehicle_in_url']}" alt="" />
        <p> Gambar Pintu Keluar </p>
        <img class="avatar" src="{results['vehicle_out_url']}" alt="" />
        <p>{results['barcode_no']}</p>
        <p>{results['plat_no']}</p>
        <p>{results['vehicle']['name']}</p>
        <p>{indexForm}</p>
    </div>


{/if}


<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati molestiae vel dolorem sit ipsam placeat quam
    ipsa, nesciunt doloremque perspiciatis!</p>


