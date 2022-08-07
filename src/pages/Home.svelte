<script>
    import {user, vehicles} from "../stores";
    import {Camera, doPostWithFormData} from "../../services/api";
    import {
        Column,
        Grid,
        ImageLoader,
        InlineLoading,
        Modal,
        Row,
        Select,
        SelectItem,
        Tag,
        TextInput,
        Tile,
        TimePicker
    } from "carbon-components-svelte";
    import {blank} from '../../helpers/helper'
    import "@fontsource/orbitron";
    import {onMount} from 'svelte';


    import * as alertify from 'alertifyjs'
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


    export let page;
    export let params;
    export let isLoading;
    let results;

    let vehicleName
    let exclude = ['area_position_out_id']
    let input = {
        'picture_vehicle_out': null,
        'barcode_no': '20220527154316PK',
        'vehicle_id': null,
        'plat_no': 'AB 1234 CD',
        'member_id' : '2987acbb',
        'area_position_out_id': process.env.AREA_POSITION,
    }

    let modalInput = {
        'bypasser_id' : null,
        'picture_vehicle_out': null,
        'vehicle_id': 1,
        'plat_no': 'manual',
        'hour': 5,
        'minute': 10,
        'area_position_out_id': process.env.AREA_POSITION,
    };

    let modalTitle=""
    let indexForm = 1;
    let img = ''
    let showTicketPeriode = false;
    let showTicketRice = false;
    let open = true;

    function getFormattedDate(date) {
        var date = new Date();
        if (!blank(date)) {
            date = new Date(date);
        }

        var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        return str;
    }

    function setAutoFocus(isFocus) {
        if (open) return;
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

    function getVehicleName(vehicle_id) {
        if (blank(vehicle_id)) {
            return ''
        }
        let arr = $vehicles.filter(function (obj) {
            return obj['id'] === vehicle_id
        });
        console.log(arr, vehicle_id)
        return arr[0]['name']
    }

    function clearData() {
        results = null;
        input = clearInput(input)
        window.removeEventListener("scroll", onkeydown);

    }

    function clearInput(input) {
        vehicleName = null;
        Object.keys(input).forEach((d) => {
            if (!blank(input[d]) || exclude.indexOf(d) > -1) {
                input[d] = null
            }
        })
        return input
    }

    async function handleSubmit(index) {
        state = 'active';
        console.log('aaaaaa', index)
        if (index === 3) {
            input['picture_vehicle_out'] = await Camera(input['barcode_no'])
            results = await doPostWithFormData('/api/ticket/find-barcode', input, $user['access_token'])
            state = 'finished';
            if (!blank(results)) {
                state = 'dormant';
                indexForm = index;
            } else{
                state = 'dormant';
                alertify.error('Tiket tidak ditemukan')
            }
        } else if (index === 4) {
            input['picture_vehicle_out'] = await Camera(input['barcode_no'])

            results = await doPostWithFormData('/api/ticket/out', input, $user['access_token'])
            state = 'finished';
            if (!blank(results)) {
                state = 'dormant';
                indexForm = index;
            } else{
                state = 'dormant';
            }
        } else {
            console.log
            indexForm = index;
            state = 'dormant';
        }
    }

    async function handleSubmitModal(){
        modalInput['picture_vehicle_out'] = await Camera(modalInput['bypasser_id'])
        console.log('modal_input ', modalInput)
        results = await doPostWithFormData('/api/ticket/baypass', modalInput, $user['access_token'])
        state = 'finished';
        if (!blank(results)) {
            state = 'dormant';
            indexForm = 4;
            modalInput = clearInput(modalInput)
            console.log('modal_input ', modalInput)
        } else{
            state = 'dormant';
            console.log('modal_input ', modalInput)
            alertify.error('Database error')
        }
    }


    function onKeyUp(e) {
        console.log(e.keyCode)
        switch (e.keyCode) {
            case 27:
                indexForm = indexForm === 1 ? indexForm : indexForm - 1;
                break;
            case 115:
                open = !open
                modalInput['bypasser_id'] = 'tikethilang'
                modalTitle = "Ticket Hilang"
                console.log(open)
                break
            case 116:
                open = !open
                modalInput['bypasser_id'] = 'manual'
                modalTitle = "Manual"
                console.log(open)
                break
            case 13:
                console.log('aaaaa', input)
                if (open) {
                    open = false
                    console.log(modalInput)
                    console.log(input)
                    handleSubmitModal()
                } else {
                    if (indexForm === 1) {
                        if (!blank(input['plat_no'])) {
                            handleSubmit(indexForm + 1)
                        }
                    } else if (indexForm === 2) {
                        if (!blank(input['barcode_no'])) {
                            handleSubmit(indexForm + 1)
                        }
                    } else if (indexForm === 3) {
                        if (!blank(input['vehicle_id'])) {
                            handleSubmit(indexForm + 1)
                        }
                    } else if (indexForm === 4) {
                        clearData()
                        indexForm = 1
                    } else {
                        indexForm += 1
                    }

                    console.log(isFocus)
                    setTimeout(() => {
                        setAutoFocus(isFocus)
                    }, 400)
                }
                break;
        }
    }


</script>
<Modal
        bind:open
        modalHeading={modalTitle}
        selectorPrimaryFocus="#input-plat-no"
        primaryButtonDisabled={true}
        hasForm={true}
        on:click:button--secondary={() => (open = false)}
        on:open
        on:close
        on:submit
>
    <br/>
    <div class="modal-box">
        <Grid>
            <Row>
                <Column>
                    <TextInput bind:value={modalInput['plat_no']} id="input-plat-no" size="xl"
                               placeholder="Enter plat no..."/>
                </Column>
            </Row>
            <Row>
                <Column>
                    <Select
                            on:change={(e)=>{
                         modalInput['vehicle_id'] = e.detail !== 'blank' ? e.detail : false
                    }}
                            selected="blank"
                    >
                        <SelectItem
                                value="blank" text="Pilih jenis kendaraan" disabled hidden/>
                        {#each $vehicles as vehicle}
                            <SelectItem
                                    value={vehicle['id']}
                                    text="{vehicle['code'] + ' - ' +getVehicleName(vehicle['id']).toUpperCase()}"/>
                        {/each}

                    </Select>
                </Column>
            </Row>
            <Row>

                <Column sm={{ span: 3, offset: 0 }}>
                    <div class="modal-time">
                        <TimePicker
                                bind:value={modalInput['hour']} light labelText="Jam" placeholder="HH">
                        </TimePicker>
                        <TimePicker
                                bind:value={modalInput['minute']} light labelText="Menit" placeholder="MM">
                        </TimePicker>
                        <TextInput
                                labelText="Tanggal"
                                placeholder="07/09/1991"
                                bind:value={modalInput['date']}
                                disabled/>
                    </div>
                </Column>
            </Row>
            <Row>
                <Column>
                    <div class="data-vehicle">
                        <Row>
                            {#each $vehicles as vehicle}
                                <Column>
                                    <p>
                                        <Tag type="outline">{vehicle['code']}</Tag> { vehicle['name']}
                                    </p>
                                </Column>
                            {/each}
                        </Row>
                    </div>
                </Column>
            </Row>
        </Grid>
    </div>

</Modal>


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
                                            bind:value={input['plat_no']}
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
                                            bind:value={input['barcode_no']}
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
                                            input['vehicle_id'] = e.detail !== 'blank' ? e.detail : false
                                            vehicleName = getVehicleName(input['vehicle_id']).toUpperCase()
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
                                    </div>


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
                                    {#if !blank(results?.['member']) }
                                        <Row>
                                            <Column>
                                                <div class="tile-wraper">
                                                    <div class="data-member">
                                                        <p>
                                                            Member Name :
                                                            <Tag type="outline">{results?.['member']?.['name']}</Tag>
                                                            Plat no :
                                                            <Tag type="outline">{results?.['member']?.['plat_no']}</Tag>
                                                            Departement :
                                                            <Tag type="outline">{results?.['member']?.['card_no']}</Tag>
                                                        </p>
                                                    </div>
                                                </div>
                                            </Column>
                                        </Row>
                                    {/if}


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
                    <div class="">
                        <p class="clock"> {hours} : {minutes} : {seconds}</p>
                        <div>
                            <TextInput
                                    labelText="Plat nomer"
                                    bind:value="{input['plat_no']}"
                                    disabled/>

                            <TextInput
                                    labelText="Barcode nomer"
                                    bind:value="{input['barcode_no']}"
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

</style>
