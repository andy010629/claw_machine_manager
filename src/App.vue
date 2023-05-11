<!-- @format -->

<template>
  <q-layout>
    <q-page-container>
      <q-page class="column justify-start items-center q-py-xl">
        <div class="row items-center">
          <div class="text-h6 text-weight-bold q-py-md q-mr-lg">
            累積幣量:
            {{ count_total }}
          </div>
          <q-btn
            label="新增紀錄"
            color="primary"
            size="lg"
            @click="openModal"
          />
        </div>

        <q-table
          :loading="!tableDataLoaded"
          :rows="tableData"
          :columns="columns"
          row-key="name"
          class="q-my-md"
          style="width: 90vw"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'delete'">
                  <q-btn
                    flat
                    color="negative"
                    style="opacity: 70%"
                    icon="delete"
                    @click="showDialog(props.rowIndex)"
                  />
                </template>
                <template v-if="col.name === 'img_location'">
                  <q-btn v-if="col.value"
                    flat
                    style="opacity: 70%"
                    icon="image"
                    @click="openImageModal(col.value)"
                  />
                  <div v-else>-</div>
                </template>
                <template v-else>
                  {{ col.value }}
                </template>
              
               
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-dialog v-model="state.modalOpened">
          <q-card class="q-px" style="width: 85vw">
            <q-card-section>
              <div class="text-h6 text-bold">新增紀錄</div>
            </q-card-section>
            <q-card-section>
              <q-input
                outlined
                type="date"
                v-model="date"
                label="日期"
                class="q-mb-md"
              />
              <q-input
                type="number"
                outlined
                v-model="text"
                label="計數器"
                class="q-mb-md"
              />
              <div class="row q-py-sm justify-between items-center">
                <div class="text-h7">出貨紀錄</div>
                <q-btn
                  round
                  flat
                  color="primary"
                  icon="add"
                  @click="addInput"
                />
              </div>
              <div
                v-for="(input, index) in inputs"
                :key="index"
                class="q-px-sm row items-center q-mb-sm"
              >
                <q-input
                  outlined
                  dense
                  v-model="input.name"
                  :label="`出貨品項 ${index + 1}`"
                />
                <q-btn
                  class="q-ml-sm"
                  flat
                  dense
                  size="sm"
                  color="red"
                  icon="remove"
                  @click="removeInput(index)"
                />
              </div>
              <q-uploader
                :url="img_host+'/uploadfile'"
                method="POST"
                label="上傳圖片"
                square
                auto-upload
                flat
                bordered
                style="width: 100%"
                field-name="file"
                @uploaded="handleUploaded"
              />

            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Close" v-close-popup />
              <q-btn @click="insert" flat label="Add" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="dialog" persistent>
          <q-card>
            <q-card-section>
              <div class="text-h6">確認刪除</div>
            </q-card-section>
            <q-card-section> 您確定要刪除此項目嗎？ </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn
                flat
                label="刪除"
                color="negative"
                @click="confirmDelete"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="imgModalOpened">
         
            <q-card-section>
              <img :src="img_host+imageModalUrl" style="width: 100%" />
            </q-card-section>
        </q-dialog>

        <div class="row justify-center" style="width: 90vw">
          <canvas id="acquisitions"></canvas>
        </div>
      </q-page>
      <!-- a table with data -->
    </q-page-container>
  </q-layout>

  <!-- <LineChart :data="chartData" :options="chartOptions" /> -->
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { QDialog, QLayout, QPage, QPageContainer } from 'quasar'

import { useCollection } from 'vuefire'
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'

import Chart from 'chart.js/auto'

const img_host = 'https://img.haobao.me'
// const img_host = 'http://localhost:8000'

const db = useFirestore()



// get the data
const columns = ref([
  // { name: "id", label: "ID", field: "id", sortable: true,  align: "left"},
  {
    name: 'delete',
    label: '删除',
    align: 'center',
  },
  
  {
    name: 'date',
    label: '日期',
    field: 'date',
    sortable: true,
    tableShow: true,
    align: 'left',
  },
  {
    name: 'text',
    label: '計數器',
    field: 'text',
    sortable: true,
    tableShow: true,
    align: 'left',
  },
  {
    name: 'items',
    label: '出貨紀錄',
    field: (row) => row.items.map((item) => item.name).join(', '),
    sortable: true,
    align: 'left',
  },
  {
    name: 'img_location',
    label: '圖片',
    field: 'img_location',
    align: 'center',
  },
])


// const tableData = ref([]);
const tableData = ref([])
const count_total = ref(0)
const img_location = ref('')
const dialog = ref(false)

const imageModalUrl = ref('')
const imgModalOpened = ref(false)

let currentIndex

function showDialog(index) {
  currentIndex = index
  console.log(currentIndex)
  dialog.value = true
}
function confirmDelete() {
  deleteRecord(tableData.value[currentIndex])
  dialog.value = false
}

function  handleUploaded(event) {
      // this.uploadedFile = event.files[0].xhr.response;
    let res =  JSON.parse(event.xhr.response)
    img_location.value = res.fileLocation
}

const tableDataLoaded = ref(false)

async function deleteRecord(record) {
  const recordRef = doc(db, 'record', record.id)
  await deleteDoc(recordRef)
}

function openImageModal(img_location) {
  imageModalUrl.value = img_location
  imgModalOpened.value = true
}

function insert() {
  const record_data = {
    date: date.value,
    text: text.value,
    items: inputs.value,
    img_location: img_location.value,
  }

  // if text is empty
  if (text.value.length === 0) {
    alert('請輸入計數器')
    return
  }

  if (
    tableData.value.length > 0 &&
    parseInt(text.value) < Math.max(...tableData.value.map((item) => item.text))
  ) {
    alert('計數器應大於上一次紀錄')
    return
  }
  addDoc(collection(db, 'record'), record_data)
  // close the modal
  state.modalOpened = false
  // reset the form
  text.value = ''
  date.value = new Date().toISOString().substr(0, 10)
  inputs.value = []
}

const state = reactive({
  modalOpened: false,
})

const text = ref('')
const date = ref(new Date().toISOString().substr(0, 10))
const inputs = ref([])

function addInput() {
  inputs.value.push({ name: '' })
}
function removeInput(index) {
  inputs.value.splice(index, 1)
}

function openModal() {
  state.modalOpened = true
}

onMounted(() => {
  onSnapshot(collection(db, 'record'), (snapshot) => {
    const newData = []
    snapshot.forEach((doc) => {
      // console.log(doc.id, " => ", doc.data())
      let data = doc.data()
      data.id = doc.id
      newData.push(data)
    })

    // sort the data by text
    newData.sort((a, b) => b.text - a.text)

    tableData.value = newData
    tableDataLoaded.value = true
    if (tableData.value.length > 0)
      count_total.value =
        Math.max(...tableData.value.map((item) => item.text)) -
        Math.min(...tableData.value.map((item) => item.text))

    const chart_data = tableData.value.map((item) => {
      return {
        date: item.date,
        text: item.text,
      }
    })
    chart_data.reverse()

    // add text diff accumlate to chart data
    chart_data.forEach((item, index) => {
      if (index === 0) {
        item.diff = 0
      } else {
        item.diff =
          item.text - chart_data[index - 1].text + chart_data[index - 1].diff
      }
    })

    new Chart(document.getElementById('acquisitions'), {
      type: 'line',
      data: {
        labels: chart_data.map((row) => row.date.substr(5)),
        datasets: [
          {
            label: '幣量走勢圖',
            data: chart_data.map((row) => row.diff),
            fill: false,
            borderWidth: 5,
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: {
              display: true, // 將此值設置為 false 以隱藏 X 軸標籤
            },
          },
        },
      },
    })
  })
})
</script>
