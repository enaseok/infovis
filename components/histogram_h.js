class Histogram_h {
    margin = {
        top: 10, right: 10, bottom: 40, left: 40
    }

    constructor(svg, width = 250, height = 250) {
        this.svg = svg;
        this.width = width;
        this.height = height;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleBand().padding(0.3);

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }

    update(data, xVar) {
        const categories = ["DRAW", "LOSE", "WIN"];
        const counts = {}

        categories.forEach((c) => {
            counts[c] = data.reduce((sum, d) => sum + d[c], 0);
        });

        this.xScale.domain([0, d3.max(Object.values(counts))]).range([0, this.width]);
        this.yScale.domain(categories).range([this.height, 0]);

        const colorScale = d3.scaleOrdinal()
            .domain(["DRAW", "LOSE", "WIN"])
            .range(["lightgreen", "lightcoral", "skyblue"]);

        this.container.selectAll("rect")
            .data(categories)
            .join("rect")
            .attr("x", 0)
            .attr("y", d => this.yScale(d))
            .attr("height", this.yScale.bandwidth())
            .attr("width", d => this.xScale(counts[d]))
            .style("fill", d => colorScale(d));

        this.container.selectAll("text.count")
            .data(categories)
            .join("text")
            .attr("class", "count")
            .attr("x", d => d === "WIN" ? this.xScale(counts[d]) / 2 : this.xScale(counts[d]))
            .attr("y", d => this.yScale(d) + this.yScale.bandwidth() / 2)
            .attr("dx", d => d === "WIN" ? "-.95em" : "0.1em")
            .attr("dy", ".35em")
            .text(d => counts[d])
            .style("font-size", "20px")
            .style("fill", "black");

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale));
    }
}
