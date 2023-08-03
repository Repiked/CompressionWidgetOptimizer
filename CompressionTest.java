import java.util.*;
import java.lang.*;

class CompressionTest {
	private static final String[] emojis = {"☀", "☂", "☃", "☄", "★", "☆", "☇", "☈", "☉", "☊", "☋", "☌", "☍", "☎", "☏", "☐", "☑", "☒", "☓", "☖", "☗", "☚", "☛", "☜", "☝", "☞", "☟", "☠", "☡", "☢", "☣", "☤","☥","☮","☯","☰","☱","☲","☳","☴","☵","☶","☷","☸","☹","☺","☻","☼","☽","☾","☿","♀","♁","♂","♃","♄","♅"};
	private static String originalStr;

	public static void main(String[] args){
		try {
			originalStr = args[0].toLowerCase();
		}
		catch(Exception e){
			System.out.println("Please enter a valid argument\n");
		}

		System.out.println(originalStr + "\n");
		
		List<Segment> segmentList = SegmentDeconstruction.generateSegments(originalStr);
		for (int i = 0; i < segmentList.size(); i++){
			segmentList.get(i).setIdentifier(i);
		}
		System.out.println(segmentList + "\n");

		State state1 = new State();
		State state2 = new State(segmentList, 0, 100, originalStr, new ArrayList<Integer>());

		System.out.println(state1);
		System.out.println(state2);

		State bestState = StateSearch.search(originalStr, segmentList);
	}

	public static String[] getEmojis(){
		return emojis;
	}

	public static String getString(){
		return originalStr;
	}
}

class Segment {
	private String str;
	private int len, occ, id = -1;

	Segment(){
		str = "";
		len = 0;
		occ = 0;
	}

	Segment(String string){
		str = string;
		len = str.length();
		occ = countOccurences(CompressionTest.getString(), str);
	}

	Segment(String string, int occurences){
		str = string;
		len = str.length();
		occ = occurences;
	}

	// returns the associated string of the segment
	public String string(){
		return str;
	}

	// returns the length of the associated string
	public int length(){
		return len;
	}

	// returns how many times the string appears in originalStr
	public int occurences(){
		return occ;
	}

	public int getIdentifier(){
		return id;
	}

	// converts a Segment to a String format
	public String toString(){
		// formatted like ["str", len, occ]
		return "[\"" + str + "\", " + len + ", " + occ + ", " + id + "]";
	}

	// checks if two Segments have the same strings
	public boolean equals(Segment otherSegment){
		return str.equals(otherSegment.string());
	}

	public Segment clone(){
		super();
	}

	// calculuates the bytes saved by the segment
	public int byteSavings(){
		return (len-1) * (occ-1) - 2;
	}

	// checks if the segment is parent to another
	public boolean isParent(Segment otherSegment){
		if (occ != otherSegment.occurences()){
			return false;
		}
		if (len-1 != otherSegment.length()){
			return false;
		}

		String offspring1 = str.substring(0, len-1);
		String offspring2 = str.substring(1, len);

		if (offspring1.equals(otherSegment.string())){
			return true;
		}
		if (offspring2.equals(otherSegment.string())){
			return true;
		}
		return false;
	}

	// checks if the segment is grandparent to another
	public boolean isGrandparent(Segment otherSegment){
		String offspring1 = str.substring(0, len-2);
		String offspring2 = str.substring(1, len-1);
		String offspring3 = str.substring(2, len);

		if (offspring1.equals(otherSegment.string())){
			return true;
		}
		if (offspring2.equals(otherSegment.string())){
			return true;
		}
		if (offspring3.equals(otherSegment.string())){
			return true;
		}
		return false;
	}

	// iterates through a string and counts instances of target, no overlap
	public static int countOccurences(String base, String target){
		int count = 0;
		int i = 0;

		while(i < base.length()-target.length()+1){
			String baseSubstring = base.substring(i, i+target.length());
			
			if ((baseSubstring).equals(target)){
				count++;
				i += target.length();
			}
			else {
				i++;
			}
		}

		return count;
	}

	// counts occurences in a split base
	public static int countFilteredOccurences(String[] base, String target){
		int count = 0;

		for (String part : base){
			count += countOccurences(part, target);
		}
		return count;
	}

	public void setIdentifier(int identifier){
		id = identifier;
	}

	public void translate(String notYetTranslatedString, Segment chosenSegment, String emoji){
		str = substitute(chosenSegment, emoji);
		len = str.length();
		occ = countFilteredOccurences(notYetTranslatedString.split(chosenSegment.string()), str);
	}

	public String substitute(Segment chosenSegment, String replacement){
		return str.replaceAll(chosenSegment.string(), replacement);
	}
}

class SegmentDeconstruction {
	// from a starter string, generates all viable segments
	public static List<Segment> generateSegments(String originalStr){
		List<Segment> segmentList = new ArrayList<Segment>();
		boolean isSegmentFound = false;
		int len = 2;

		do {
			for (int i = 0; i < originalStr.length()-len+1; i++){
				String possibleStr = originalStr.substring(i, i + len);

				if (checkIfStringInSegmentList(segmentList, possibleStr)){
					continue;
				}

				Segment possibleSegment = new Segment(possibleStr);

				if (possibleSegment.byteSavings() <= 0){
					continue;
				}

				isSegmentFound = true;
				deleteChildrenInSegmentList(segmentList, possibleSegment, false);
				segmentList.add(possibleSegment);
			}
			len++;
		}
		while (isSegmentFound && len <= originalStr.length()/2);

		return segmentList;
	}

	// checks if a String is in a given segmentList
	public static boolean checkIfStringInSegmentList(List<Segment> segmentList, String str){
		for (Segment segment : segmentList){
			if (segment.string().equals(str)){
				return true;
			}
		}
		return false;
	}

	// Given segment, deletes all children/grandchildren in segmentList
	public static void deleteChildrenInSegmentList(List<Segment> segmentList, Segment segment, boolean onlyGrandchildren){
		if (onlyGrandchildren){
			segmentList.removeIf(seg -> segment.isGrandparent(seg));
		}
		else {
			segmentList.removeIf(seg -> segment.isParent(seg));
		}
	}
}

class State {
	private List<Segment> segmentList;
	private int min, max, current;
	private String translatedStr;
	private List<Integer> fingerprint;

	State(){
		segmentList = new ArrayList<Segment>();
		min = 0;
		current = 0;
		max = (int) Math.pow(CompressionTest.getString().length()/2, 2);
		translatedStr = CompressionTest.getString();
		fingerprint = new ArrayList<Integer>();
	}

	State(List<Segment> segmentArrayList, int[] scores, String translatedString, List<Integer> fingerprint){
		this.segmentList = segmentArrayList.stream()
			.map(segment -> segment.clone())
			.collect(Collections.toList());
		current = scores[0];
		min = scores[1];
		max = scores[2];
		translatedStr = translatedString;
		this.fingerprint = new ArrayList<Integer>(fingerprint);
	}

	public List<Segment> segmentList(){
		return segmentList;
	}

	public int minimum(){
		return min;
	}

	public int maximum(){
		return max;
	}

	public String translatedString(){
		return translatedStr;
	}

	public List<Integer> fingerprint(){
		return fingerprint;
	}

	/*
		Formatted as such:
		Segment list: ---
		Translated string: ---
		Minimum: ---
		Maximum: ---
		Fingerprint: ---
	*/
	public String toString(){
		return "Segment list: " + segmentList + "\nTranslated string: \"" + translatedStr + "\"\nMinimum: " + min + "\nMaximum: " + max + "\nFingerprint: " + fingerprint + "\n";
	}

	public boolean equals(State otherState){
		return fingerprint.equals(otherState.fingerprint());
	}

	public void addSegment(Segment chosenSegment){
		String currentEmoji = CompressionTest.getEmojis()[segmentList.size()];

		segmentList.forEach(seg -> seg.translate(translatedStr, chosenSegment, currentEmoji));
		segmentList.removeIf(seg -> seg.byteSavings() <= 0);
		segmentList.add(chosenSegment);
		fingerprint.add(chosenSegment.getIdentifier());
		Collections.sort(fingerprint);
	}
}

class StateSearch {
	public static State search(String originalStr, List<Segment> segmentList){
		Queue<State> states = new ArrayDequeue<State>(1024);

		states.add

		return new State();
	}
}