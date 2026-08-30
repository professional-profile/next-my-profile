interface Props {
    list: any[]
    resource: any
}

export default function ReviewList({ list }: Props) {
    if (!list || list.length === 0) {
        return (
            <div
                style={{
                    marginTop: 40,
                    textAlign: "center",
                    color: "#666",
                }}
            >
                No reviews.
            </div>
        )
    }

    return (
        <div style={{ marginTop: 30 }}>
            {list.map((item, index) => (
                <div
                    key={index}
                    style={{
                        borderBottom: "1px solid #eee",
                        padding: "20px 0",
                    }}
                >
                    <strong>{item.userName}</strong>

                    <div>
                        {"★".repeat(item.rate)}
                    </div>  

                    <p>{item.review}</p>
                </div>
            ))}
        </div>
    )
}