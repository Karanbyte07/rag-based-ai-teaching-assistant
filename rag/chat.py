from retreive import retreive

incoming_query = input("Ask a question: ")
results = retreive(incoming_query)

# print(results[["tutorial_number", "tutorial_name", "duration", "text"]])

for index, row in results.iterrows():
    print(f"Tutorial Number: {row['tutorial_number']}")
    print(f"Tutorial Name: {row['tutorial_name']}")
    print(f"Duration: {row['duration']}")
    print(f"Text: {row['text']}")
    print("-" * 50)
