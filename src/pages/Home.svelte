<script>
    import {user, vehicles} from "../stores";
    import {doGet, doPost, doPostWithImage, CameraOut} from "../../services/api";
    import {Route, SetUser} from "../routes";
    import {AspectRatio} from "carbon-components-svelte";
    import {Grid, Row, Column} from "carbon-components-svelte";
    import {ImageLoader} from "carbon-components-svelte";
    import {Select, SelectItem} from "carbon-components-svelte";
    import {Tile} from "carbon-components-svelte";
    import {TextInput} from "carbon-components-svelte";
    import {blank} from '../../helpers/helper'
    import "@fontsource/orbitron";
    import {Button, ButtonSet, InlineLoading} from "carbon-components-svelte";
    import {Tag} from "carbon-components-svelte";
    import {onMount} from 'svelte';
    /*
        * @Todo : Kurang jam (Done)
        * @Todo : Jenis pembayaran
        * @Todo : Nampilin data dari Database saat habis scan barcode (Done)
        * @Todo : Urutan ke 2 scan barcode ke 3 jenis kendaraan (Done)
        * @Todo : Saat pilih jenis kendaraan ada penjelasan key nya (Done)
        * @Todo : Vehicle selection box bisa pilih dengan key(Done)
        * @Todo : Tampilin data user : nama shift pos (Done)
        * @Todo : f4 manual jam masuk kendaraan noplat
        * @Todo : f5 Ticket hilang : sam kaya manual cuma plus dendas
        * @Todo : Logout
        * @Todo : Logo
        * @Todo : Tiap mesin punya ID token dan pos_id
        * @Todo : Buat Api baru POST saat scan barcode
        * @Todo : Response API kurang menit
        * @Todo : Pos ambil dari DB
        * @Todo : vALIDASI & ERROR HANDLING
     */


    let time = new Date();
    let isFocus

    $: hours = (time.getHours() < 10) ? "0" + time.getHours() : time.getHours();
    $: minutes = (time.getMinutes() < 10) ? "0" + time.getMinutes() : time.getMinutes();
    $: seconds = (time.getSeconds() < 10) ? "0" + time.getSeconds() : time.getSeconds();

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

    let state = "dormant";

    const areaPosition = process.env.AREA_POSITION;
    export let page;
    export let params;
    export let isLoading;
    let results;
    let vehicle;
    let vehicleName
    let indexForm = 1;
    let barcode_no = '20220527154316PK';
    let plat_no = 'AB24325C';
    let img = ''
    let showTicketPeriode = false;
    let showTicketRice = false;


    function getFormattedDate(date) {
        var date = new Date();
        if (!blank(date)) {
            date = new Date(date);
        }

        var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        return str;
    }

    function setAutoFocus(isFocus) {
        console.log(isFocus)
        isFocus = isFocus?.['$$']?.['ctx']

        if (!blank(isFocus)) {
            console.log('--->', (typeof isFocus))
            console.log('--->', (isFocus))
            if (blank(isFocus[0]) || typeof isFocus[0] == "string") {
                isFocus = isFocus[1]
            } else {
                isFocus = isFocus[0]
            }
            console.log('--->', (isFocus))
            isFocus.focus()
            isFocus.autofocus = true
        }
        console.log('--->', isFocus)
    }

    onMount(() => {
        console.log(document.getElementById('test'))
        // console.log(isFocus.$$.ctx[1])
        // isFocus.$$.ctx[1].autofocus = true
        // console.log(isFocus.$$.ctx[1].focus())
        // isFocus.focus = true
        setAutoFocus(isFocus)
        const interval = setInterval(() => {
            time = new Date();
        }, 1000);

        return () => {
            clearInterval(interval);
        };

    });
    console.log('data user ', $user)

    function filterIt(arr, searchKey) {
        return arr.filter(function (obj) {
            return Object.keys(obj).some(function (key) {
                return obj[key].includes(searchKey);
            })
        });
    }

    function getVehicleName(vehicle) {
        if (blank(vehicle)) {
            return ''
        }
        let arr = $vehicles.filter(function (obj) {
            return obj['id'] === vehicle
        });
        console.log(arr, vehicle)
        return arr[0]['name']
    }

    function clearData() {
        results = null;
        vehicle = null;
        barcode_no = null;
        plat_no = null;
        vehicleName = null;
        window.removeEventListener("scroll", onkeydown);

    }

    function handleSubmit(index) {
        state = 'active';
        console.log('aaaaaa', index)
        if (index === 3 || index === 4) {
            const formData = new FormData()
            const reader = new FileReader();
            CameraOut()
                .then((response) => response.blob())
                .then((blob) => {
                    console.log(blob)

                    console.log(reader, barcode_no)
                    // reader.onload = function (e) {
                    const file = new File([blob], barcode_no + ".jpeg", {
                        type: 'image/jpeg'
                    });
                    if (!blank(file)) formData.append('picture_vehicle_out', file)
                    if (!blank(barcode_no)) formData.append('barcode_no', barcode_no)
                    if (!blank(vehicle)) formData.append('vehicle_id', vehicle)

                    formData.append('area_position_out_id', areaPosition)
                    doPostWithImage('/api/ticket/out', formData, $user['access_token'])
                        .then(function (response) {
                            console.log(index, response)
                            results = response;

                            state = 'finished';
                            indexForm = index;
                            state = 'dormant';
                        }).catch((e) => {
                        console.log('error')
                        console.log(e)
                    })
                    // };
                    // return URL.createObjectURL(blob)
                }).then((src) => {
                img = src

            }).catch((e) => {
                console.log(e)
            })

        } else {
            console.log
            indexForm = index;
        }
    }


    function onKeyUp(e) {
        console.log(e.keyCode)
        let input = '';
        switch (e.keyCode) {
            case 27:
                indexForm = indexForm === 1 ? indexForm : indexForm - 1;
                break;
            case 13:

                if (indexForm === 2) {
                    if (!blank(plat_no)) {
                        handleSubmit(indexForm + 1)
                    }
                } else if (indexForm === 3) {
                    if (!blank(vehicle)) {
                        handleSubmit(indexForm + 1)
                    }
                } else if (indexForm === 4) {
                    indexForm = 1
                    clearData()
                } else {
                    indexForm += 1
                }
                console.log(isFocus)
                setTimeout(() => {
                    setAutoFocus(isFocus)
                }, 400)
                break;
        }
    }


</script>
<Grid>
    <Row>
        {#if state !== "dormant"}
            <Column sm={{ span: 3, offset: 0 }}>
                <Row>
                    <Column sm={{ span: 4, offset: 0 }}>
                        <InlineLoading status={state} description={descriptionMap[state]}/>
                    </Column>
                </Row>
            </Column>


        {:else}
            <Column sm={{ span: 3, offset: 0 }}>
                <Row>
                    <Column sm={{ span: 4, offset: 0 }}>
                        <div class="tile-wraper ">
                            {#if indexForm === 1}
                                <form
                                        on:submit|preventDefault={() =>{ }}
                                >
                                    <label id="focus" class="label-xl">
                                        Plat No
                                    </label>
                                    <TextInput
                                            size="xl"
                                            bind:this={isFocus}
                                            bind:value={plat_no}
                                            type="text"
                                            name="password"
                                            invalid={!blank(results) && !blank(results?.['errors']?.['plat_no'])}
                                            invalidText={results?.['errors']?.['plat_no']?.[0]}
                                            placeholder="Enter plat no...."
                                    />
                                </form>
                            {:else if indexForm === 2}
                                <form
                                        on:submit|preventDefault={() =>{ }}
                                >
                                    <label class="label-xl">
                                        Barcode Number
                                    </label>
                                    <TextInput
                                            bind:this={isFocus}
                                            size="xl"
                                            bind:value={barcode_no}
                                            type="text"
                                            name="password"
                                            invalid={!blank(results) && !blank(results?.['errors']?.['barcode_no'])}
                                            invalidText={results?.['errors']?.['barcode_no']?.[0]}
                                            placeholder="Enter barcode no...."
                                    />
                                </form>
                            {:else if indexForm === 3}
                                <form class="custom-input-1"
                                      on:keydown={(e)=>{onKeyUp(e)}}
                                      on:submit|preventDefault={() =>{ }}
                                >
                                    <label class="label-xl">
                                        Jenis Kendaraan
                                    </label>
                                    <Select
                                            bind:this={isFocus}
                                            on:change={(e)=>{
                                            vehicle = e.detail !== 'blank' ? e.detail : false
                                            vehicleName = getVehicleName(vehicle).toUpperCase()
                                        }}
                                            selected="blank"

                                            size="xl"
                                    >
                                        <SelectItem

                                                value="blank" text="Pilih jenis kendaraan" disabled hidden/>
                                        {#each $vehicles as vehicle}
                                            <SelectItem
                                                    value={vehicle['id']}
                                                    text="{vehicle['code'] + ' - ' +getVehicleName(vehicle['id']).toUpperCase()}"/>
                                        {/each}

                                    </Select>

                                    <div class="data-member">
                                        <Row>
                                            {#each $vehicles as vehicle}
                                                <Column>
                                                <p>
                                                <Tag type="outline">{vehicle['code']}</Tag> { vehicle['name']}
                                                </p>
                                                </Column>
                                            {/each}
                                        </Row>



                                </form>

                            {:else if indexForm === 4}
                                <Column>

                                    <Row>
                                        <Column>
                                            <div class="tile-wraper">
                                                <p class="clock"> {results?.['day']} HARI : {results?.['hour']} JAM : 00
                                                    MENIT </p>
                                            </div>
                                            <label class="label-xl">
                                                Total harga
                                            </label>
                                            <TextInput
                                                    size='xl'
                                                    value="{results?.['total_price']}"
                                                    disabled/>

                                        </Column>
                                    </Row>
                                    <Row>
                                        <Column>
                                            <div class="tile-wraper">
                                                <div class="data-member">
                                                    <p>
                                                        Member Name :
                                                        <Tag type="outline">Saya</Tag>
                                                        Plat no :
                                                        <Tag type="outline">{plat_no}</Tag>
                                                        Departement :
                                                        <Tag type="outline">Sunda</Tag>
                                                    </p>
                                                </div>
                                            </div>
                                        </Column>
                                    </Row>

                                    <!--                                    <Row>-->

                                    <!--                                        <Column>-->
                                    <!--                                            <div class="tile-wraper">-->
                                    <!--                                                <div>-->
                                    <!--                                                    <TextInput-->
                                    <!--                                                            labelText="Total hari inap"-->
                                    <!--                                                            value="{results?.['day']}"-->
                                    <!--                                                            disabled/>-->

                                    <!--                                                    <TextInput-->
                                    <!--                                                            labelText="Total harga inap"-->
                                    <!--                                                            value="{results?.['price_day']}"-->
                                    <!--                                                            disabled/>-->
                                    <!--                                                </div>-->

                                    <!--                                            </div>-->
                                    <!--                                        </Column>-->

                                    <!--                                        <Column>-->
                                    <!--                                            <div class="tile-wraper">-->
                                    <!--                                                <div>-->
                                    <!--                                                    <TextInput-->
                                    <!--                                                            labelText="Total jam inap"-->
                                    <!--                                                            value="{results?.['hour']}"-->
                                    <!--                                                            disabled/>-->

                                    <!--                                                    <TextInput-->
                                    <!--                                                            labelText="Total harga jam tingal"-->
                                    <!--                                                            value="{results?.['price_hour']}"-->
                                    <!--                                                            disabled/>-->
                                    <!--                                                    <TextInput-->
                                    <!--                                                            labelText="Total harga "-->
                                    <!--                                                            value="{results?.['total_price']}"-->
                                    <!--                                                            disabled/>-->

                                    <!--                                                </div>-->

                                    <!--                                            </div>-->
                                    <!--                                        </Column>-->
                                    <!--                                    </Row>-->
                                </Column>
                            {:else}
                                <div>

                                </div>


                            {/if}
                        </div>
                    </Column>
                </Row>
            </Column>
        {/if}
        <!--            Row 3-->
        <Column>
            <Row>
                <Column sm={{ span: 4, offset: 0 }}>
                    <div class="tile-wraper">
                        <p class="clock"> {hours} : {minutes} : {seconds}</p>
                        <div>
                            <TextInput
                                    labelText="Plat nomer"
                                    bind:value="{plat_no}"
                                    disabled/>

                            <TextInput
                                    labelText="Barcode nomer"
                                    bind:value="{barcode_no}"
                                    disabled/>
                            <TextInput
                                    bind:value="{vehicleName}"
                                    labelText="Jenis kendaraan"

                                    disabled/>
                        </div>

                    </div>
                </Column>
            </Row>
        </Column>
    </Row>
    <Row>
        {#if indexForm == 4}
            <Column>
                <Row>
                    <Column>
                        <div class="tile-wraper-image">
                            <Tile>
                                <p class="tile-block"> Gambar Pintu Masuk </p>
                                <div class="image-wraper">
                                    <ImageLoader
                                            ratio="16x9"
                                            src="{
                                                    blank(results) ?
                                                    'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg'
                                                    : results?.['ticket']?.['vehicle_in_url']
                                                   }"
                                    />
                                </div>

                            </Tile>
                        </div>
                    </Column>

                    <Column>
                        <div class="tile-wraper-image">
                            <Tile>
                                <p class="tile-block"> Gambar Pintu Keluar </p>
                                <div class="image-wraper">
                                    <ImageLoader
                                            ratio="16x9"
                                            src="{
                                                                        blank(results) ?
                                                                        'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg'
                                                                        : results?.['ticket']?.['vehicle_out_url']
                                                                    }"
                                    />
                                </div>

                            </Tile>
                        </div>
                    </Column>
                </Row>
            </Column>
            {:else}
            <Column>
                <Row>
                    <Column sm={{ span: 1, offset:3 }}>
                                <div class="logo-wraper">
                                    <ImageLoader
                                            ratio="16x9"
                                            src='https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg'
                                    />
                                </div>
                    </Column>
                </Row>
            </Column>

        {/if}
    </Row>
</Grid>
<svelte:window on:keyup|preventDefault={onKeyUp}/>

<style>
    .tile-block {
        background-color: white;
        color: black;
        margin-bottom: 0px;
        text-align: center;
    }

    .tile-wraper {
        margin-bottom: 20px;
    }

    .tile-wraper-image {
        margin: auto;
        margin-bottom: 20px;
        /*max-width: 500px;*/
    }

    .image-wraper {
        border: 5px solid white;

    }

    .clock {
        color: #17D4FE;
        font-size: 25px;
        font-family: Orbitron;
        letter-spacing: 7px;
        text-align: center;
        border: 1px solid #17D4FE;
        padding: 10px;
        margin-bottom: 20px;
    }
    .logo-wraper{
        margin-top: 150px;
    }

    .data-member {
        margin-top: 10px;
        padding: 10px;
        width: 100%;
        letter-spacing: 3px;

        background-color: #525252;
        font-family: var(---font-cosmetic);
        color: var(--color-cosmetic-blue);
        text-align: center;
    }
</style>
