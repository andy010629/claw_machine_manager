<template>
  <q-layout>
    <q-page-container>
      <q-page class="row justify-center items-start q-py-xl">
        <q-btn label="新增紀錄" color="primary" size="lg" @click="openModal" />
        <q-dialog v-model="state.modalOpened">
          <q-card class="q-px" style="width: 70vw;">
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
              <q-input outlined v-model="text" label="計數器" class="q-mb-md" />
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
                <q-input outlined  dense v-model="input.text" :label="`出貨品項 ${index+1}`"/>
                <q-btn class="q-ml-sm"  flat dense size="sm"  color="red" icon="remove"  @click="removeInput(index)" />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Close" v-close-popup />
              <q-btn flat label="Add" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { reactive, ref } from "vue";
import { QDialog, QLayout, QPage, QPageContainer } from "quasar";

const state = reactive({
  modalOpened: false,
});

const text = ref("");
const date = ref(new Date().toISOString().substr(0, 10));
const inputs = ref([]);

function addInput() {
  inputs.value.push({ text: "" });
}
function removeInput(index) {
  inputs.value.splice(index, 1);
}

function openModal() {
  state.modalOpened = true;
}
</script>
