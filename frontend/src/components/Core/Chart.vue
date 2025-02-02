<template>
  <div :id="'chartnext-' + id">
    <apexchart
      :height="height"
      :options="chartOptions"
      :series="seriesRes"
      :type="type"
      :width="getWidth()"
      title=""
      v-if="apex"
    ></apexchart>
    <template v-else-if="type === 'line'">
      <Line
        v-if="chartJSData"
        :data="chartJSData"
        :options="chartJSOptions"
        :style="height ? `max-height: ${height}px; height: ${height}px;` : ''"
      />
    </template>
    <template v-else-if="type === 'bar'">
      <Bar
        v-if="chartJSData"
        :data="chartJSData"
        :options="chartJSOptions"
        :style="height ? `max-height: ${height}px; height: ${height}px;` : ''"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Line, Bar } from "vue-chartjs";
import apexchart from "vue3-apexcharts";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  BarElement
} from "chart.js";
import { defineComponent } from "vue";
import chartJS from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement
);
export default defineComponent({
  name: "Chart",
  props: [
    "data",
    "height",
    "width",
    "type",
    "id",
    "name",
    "color",
    "series",
    "horizontal",
    "apex"
  ],
  components: { Line, Bar, apexchart },
  computed: {
    chartJSData() {
      return {
        labels: this.data?.labels,
        datasets: [
          {
            label: this.name,
            data: this.data?.data,
            borderColor: this.color || this.$user.theme.colors.primary,
            backgroundColor:
              this.type === "line"
                ? "white"
                : this.color || this.$user.theme.colors.primary
          }
        ]
      };
    },
    chartJSOptions() {
      return {
        responsive: true,
        maintainAspectRatio: !this.height,
        title: {
          display: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: "index",
            intersect: false
          },
          hover: {
            mode: "index",
            intersect: false
          }
        },
        animation: {
          duration: 1
        }
      } as chartJS.ChartOptions;
    },
    chartOptions() {
      const result = {
        plotOptions: {
          bar: {
            horizontal: this.horizontal || false
          }
        },
        c: this.series,
        stroke: {
          colors: [this.color || this.$user.theme.colors.primary]
        },
        colors: [this.color || this.$user.theme.colors.primary],
        grid: {
          borderColor: "#474747"
        },
        dataLabels: {
          enabled: false
        },
        bar: {
          plotOptions: {
            total: {
              show: true,
              label: "Total"
            }
          }
        },
        theme: {
          mode: "dark",
          palette: "palette1"
        },
        chart: {
          markers: {
            colors: ["white"],
            size: 4,
            color: "white",
            strokeColors: "#fff"
          },
          animations: {
            enabled: false,
            easing: "easeinout",
            speed: 400,
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          },
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false
            }
          },
          background: "transparent",
          id: "chartnext-" + this.id
        },
        xaxis: undefined as any
      };
      if (!this.series) {
        result.xaxis = {
          categories: this.data.labels
        };
      }
      return result;
    },
    seriesRes() {
      return !this.series
        ? [
            {
              name: this.name || "TPUvNEXT-Default",
              data: this.data.data
            }
          ]
        : this.series;
    }
  },
  methods: {
    getWidth() {
      if (this.width) return this.width;
      return "100%";
    }
  }
});
</script>
