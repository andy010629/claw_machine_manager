<template>
  <q-layout>
    
    <q-page-container>
      <q-page class="column justify-start items-center q-py-xl">
        <q-btn label="新增紀錄" color="primary" size="lg" @click="openModal" />
        <div class="text-h6 text-weight-bold q-py-md">累積幣量:
          {{ count_total }}
        </div>
         <q-table

  :loading="!tableDataLoaded"
  :rows="tableData"
  :columns="columns"
  row-key="name"
  class="q-my-md"
  style="width: 90vw;"
>
  <template v-slot:body="props">
    <q-tr :props="props">
      
      <q-td v-for="(col,idx) in props.cols" :key="col.name" :props="props">
         <template v-if="col.name === 'delete'">
        <q-btn flat color="negative" style="opacity:70%" icon="delete" @click="showDialog(idx)" />
      </template>
        {{ col.value }}
      </q-td>
    </q-tr>
  </template>
      </q-table>
        <q-dialog v-model="state.modalOpened">
          <q-card class="q-px" style="width: 85vw;">
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
              <q-input type="number" outlined v-model="text" label="計數器" class="q-mb-md" />
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
                <q-input outlined  dense v-model="input.name" :label="`出貨品項 ${index+1}`"/>
                <q-btn class="q-ml-sm"  flat dense size="sm"  color="red" icon="remove"  @click="removeInput(index)" />
              </div>
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
        <q-card-section>
          您確定要刪除此項目嗎？
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="刪除" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
      </q-page>
      <!-- a table with data -->
      
    </q-page-container>
    
  </q-layout>
</template>

<script setup>
import { reactive, ref } from "vue";
import { QDialog, QLayout, QPage, QPageContainer } from "quasar";

import { useCollection } from 'vuefire'
import { collection ,addDoc,onSnapshot,doc, deleteDoc} from 'firebase/firestore'

import { useFirestore } from 'vuefire'

const db = useFirestore()

// const todos = useCollection(collection(db, 'todo'))


// get the data
const columns = ref([

  // { name: "id", label: "ID", field: "id", sortable: true,  align: "left"},
  {
    name: "delete",
    label: "删除",
    align: "center"
  
  },
  { name: "date", label: "日期", field: "date", sortable: true,tableShow: true, align: "left" },
  { name: "text", label: "計數器", field: "text", sortable: true ,tableShow: true, align: "left"},
  { name: "items", label: "出貨紀錄", field: (row) => row.items.map((item) => item.name).join(', '), sortable: true  ,align: "left"},
 
]);

// const tableData = ref([]);
const tableData = ref([]);
const count_total = ref(0);

const dialog = ref(false);
let currentIndex;

function showDialog(index) {
  currentIndex = index;
  dialog.value = true;
}

function confirmDelete() {
  deleteRecord(tableData.value[currentIndex]);
  dialog.value = false;
}


const tableDataLoaded = ref(false);

onSnapshot(collection(db, "record"), (snapshot) => {
  const newData = [];
  snapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data())
    let data = doc.data();
    data.id = doc.id;
    newData.push(data);
  });
  // sort the data by text
  newData.sort((a, b) => b.text - a.text);

  tableData.value = newData;
  tableDataLoaded.value = true;
  if(tableData.value.length > 0)
    count_total.value = Math.max(...tableData.value.map((item) => item.text)) - Math.min(...tableData.value.map((item) => item.text))
});



async function deleteRecord(record) {
 
  const recordRef = doc(db, "record", record.id);
  await deleteDoc(recordRef);
}


function insert() {
  const record_data = {
    date: date.value,
    text: text.value,
    items: inputs.value,
  }
  if(tableData.value.length>0 && parseInt(text.value) < Math.max(...tableData.value.map((item) => item.text))){
    alert("計數器應大於上一次紀錄")
    return
  }
  addDoc(collection(db, "record"), record_data);
  // close the modal
  state.modalOpened = false;
  // reset the form
  text.value = "";
  date.value = new Date().toISOString().substr(0, 10);
  inputs.value = [];
}


const state = reactive({
  modalOpened: false,
});

const text = ref("");
const date = ref(new Date().toISOString().substr(0, 10));
const inputs = ref([]);

function addInput() {
  inputs.value.push({ "name": "" });
}
function removeInput(index) {
  inputs.value.splice(index, 1);
}

function openModal() {
  state.modalOpened = true;
}
</script>
