<script>
import { Line } from 'vue-chartjs'

export default {
  props: {
    chartData: Object,
    fontColor: String,
  },

  extends: Line,

  computed: {
    options () {
      return {
        scales: {
          xAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
              fontColor: this.fontColor,
            }
          }],
          yAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
              fontColor: this.fontColor,
            }
          }],
        },
        legend: {
          display: false,
        },
        elements: {
          point: {
            hitRadius: 10,
            hoverRadius: 10,
            radius: 0,
          }
        }
      }
    }
  },

  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>