class RadarChart {
    constructor(svg, tooltip) {
        this.svg = svg;
        this.tooltip = tooltip;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.margin = { top: 31, right: 31, bottom: 31, left: 31 };
        this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
        this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
        this.radius = Math.min(this.width, this.height) / 2;
        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.g = this.svg.append("g")
            .attr("transform", `translate(${this.width / 2 + this.margin.left}, ${this.height / 2 + this.margin.top})`);
    }

    update(data, category) {
        const radarData = data.map(d => [
            { axis: "OVERALL", value: d.OVERALL },
            { axis: "STRIKING", value: d.STRIKING },
            { axis: "GRAPPLING", value: d.GRAPPLING },
            { axis: "STAMINA", value: d.STAMINA },
            { axis: "FIGHTIQ", value: d.FIGHTIQ }
        ]);

        const displayData = data.map(d => [
            { axis: "NAME", value: d.NAME },
            { axis: "RANKING", value: d.RANKING },
            { axis: "DIVISION", value: d.DIVISION }
        ]);

        const angleSlice = 2 * Math.PI / 5;
        const maxValue = 10;
        const rScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, this.radius]);

        console.log(radarData[0].length, maxValue);

        const drawAxis = (g) => {
            radarData[0].forEach((d, i) => {
                const x = rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2);
                const y = rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2);
                g.append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", x)
                    .attr("y2", y)
                    .style("stroke", "black")
                    .style("stroke-width", "1px");

                g.append("text")
                    .attr("x", x * 1.1)
                    .attr("y", y * 1.1)
                    .attr("dy", "0.35em")
                    .style("font-size", "12px")
                    .style("text-anchor", "middle")
                    .text(d.axis);
            });
        };

        const drawCircles = (g) => {
            for (let j = 0; j <= maxValue; j++) {
                g.append("circle")
                    .attr("r", rScale(j))
                    .style("fill", "none")
                    .style("stroke", "lightgray")
                    .style("stroke-width", "0.5px");
            }
        };

        const drawRadar = (g, color) => {
            const line = d3.lineRadial()
                .radius(d => rScale(d.value))
                .angle((d, i) => i * angleSlice)
                .curve(d3.curveLinearClosed);

            radarData.forEach((data) => {
                g.append("path")
                    .datum(data)
                    .attr("d", line)
                    .style("stroke", color)
                    .style("stroke-opacity", 0.3)
                    .style("stroke-width", "1.5px")
                    .style("fill", color)
                    .style("fill-opacity", 0.2)
                    .on("mouseover", (e, d) => {
                        const overallData = d.find(obj => obj.axis === 'OVERALL');
                        const strikingData = d.find(obj => obj.axis === 'STRIKING');
                        const grapplingData = d.find(obj => obj.axis === 'GRAPPLING');
                        const staminaData = d.find(obj => obj.axis === 'STAMINA');
                        const fightiqData = d.find(obj => obj.axis === 'FIGHTIQ');

                        const i = radarData.findIndex(data => data === d);
                        const nameData = displayData[i].find(obj => obj.axis === 'NAME');
                        const rankingData = displayData[i].find(obj => obj.axis === 'RANKING');
                        const divisionData = displayData[i].find(obj => obj.axis === 'DIVISION');

                        this.tooltip.select(".tooltip-inner")
                            .html(`NAME: ${nameData.value}<br/>RAKKING: ${rankingData.value}<br/>DIVISION: ${divisionData.value}<br/>OVERALL: ${overallData.value}<br/>STRIKING: ${strikingData.value}<br/>GRAPPLING: ${grapplingData.value}<br/>STAMINA: ${staminaData.value}<br/>FIGHTIQ: ${fightiqData.value}`);

                        Popper.createPopper(e.target, this.tooltip.node(), {
                            placement: 'top',
                            modifiers: [
                                {
                                    name: 'arrow',
                                    options: {
                                        element: this.tooltip.select(".tooltip-arrow").node(),
                                    },
                                },
                            ],
                        });

                        this.tooltip.style("display", "block");
                    })
                    .on("mouseout", (d) => {
                        this.tooltip.style("display", "none");
                    });
            });
        };

        this.g.selectAll("*").remove();
        drawAxis(this.g);
        drawCircles(this.g);

        radarData.forEach((data, i) => {
            drawRadar(this.g, this.color(i));
        });
    }
}