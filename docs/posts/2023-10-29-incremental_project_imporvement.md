---
title: "Java Incremental Project Improvement"
date:
   created: 2023-10-29
   updated: 2023-11-03
categories:
   - informatics
readtime: 10
---
# Our Use Case and Tools

*EDITED*  Adding PMD suppression explanations.

I have recently decided to try to improve the code base we have been working on for 4 months or so by installing some static code analysis tools. The two main libraries in question are *PMD*[^pmd] and *Checkstyle* - old classics of the Java world that still get regular updates despite their age.  
Besides those two, we also have a more modern testing library called *ArchUnit*[^archunit] to add some architecture rules and guidelines to the project.

To nobody's surprise, the result of the initial checks was disastrous. We had more than 2000 PMD error violations and even more checkstyle warnings.

My initial approach was to try to fix and clean as many things I could possible do during free afternoon, but I quickly ended up in an entangled web of refactoring leading nowhere. Frustration quickly settled in and I was forced to call in the day with a very bad mood and no improvement at all.  
If any progress was to be made I would have to find a way to break the problem into smaller bite-sized incremental steps.

## PMD configuration

My first idea was to disable most of the PMD checks using exclude statements and fix the rest. 

```xml
<rule ref="category/java/bestpractices.xml">
    <exclude name="GuardLogStatement"/>
    <exclude name="LiteralsFirstInComparisons"/>
    ...
</rule>

<rule ref="category/java/design.xml">
    <exclude name="LawOfDemeter"/>
    <exclude name="DataClass"/>
    <exclude name="ImmutableField"/>
    <exclude name="TooManyFields"/>
    ...
</rule>

```

This improved a little bit the quality of our code but there was still a glaring issue - new code could still be added that violates all of the excluded rules. We also had no idea how much work needed to be done to activate any of the disabled rules.

Our sprint was closing to an end, and we had a little bit of free time in between retrospective meetings and such.  
This is when I had the idea to just enable all PMD checks and simply count the errors we had. We would then go over the list and decide which person in the team would fix which failing rules.

If we do this at the end of each sprint we should in theory be able to progressively activate more and more rules and hence improve quality gradually.

### Maven Config
I quickly added some maven configuration for the pmd plugin :

1. Adding two pmd config files **pmd-full.xml** with all rules enabled and **pmd.xml** with our current state.

1. PMD plugin in maven
    ```xml
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-pmd-plugin</artifactId>
        <version>3.21.0</version>
        <configuration>
            <failOnViolation>true</failOnViolation>
            <failurePriority>3</failurePriority>
            <printFailingErrors>true</printFailingErrors>
            <maxAllowedViolations>5</maxAllowedViolations>
            <rulesets>
                <ruleset>${pmd-file}</ruleset>
            </rulesets>
        </configuration>
        <executions>
            <execution>
                <goals>
                    <goal>check</goal>
                </goals>
            </execution>
        </executions>
    </plugin>
    ```

1. And to switch between the two configuration files:
    ```xml
    <profiles>
        <profile>
            <id>pmd-full</id>
            <properties>
                <pmd-file>pmd-full.xml</pmd-file>
            </properties>
        </profile>
    </profiles>
    ```

1. Now running ```mvn pmd:check -Ppmd-full -pl :project-id``` will run maven with **pmd-full** profile that will load the full pmd check and running with no profile will run the default (current) **pmd.xml**.

### Reactivating Rules

The next step was to start activating the excluded rules one-by-one by fixing whatever we can and ignoring the rest with the annotation:

1. Run pmd for your module
    ```bash
    mvn pmd:check -pl :my-module
    ```

1. Identify a rule that you wish to reactivate

1. Fix as much violations as you while time-boxing yourself to avoid endless refactoring.

1. Suppress the rest with annotations
    ```
    @SuppressWarnings("PMD.UnusedLocalVariable")
    ```

### Hacking a Script
Let's add a simple shell script that will clean the output of the command and then do sort and count so we get a nice output:

*source_code_health.sh*
```bash
if [ -z "$1" ]; then
  echo "Usage: source_code_health.sh <module to analyse>.
  exit 1
fi

mkdir -p "code_health"

mvn pmd:check -Ppmd-full -pl ":$1" > result.pmd
awk '/\[INFO\] PMD Failure/ {print $0}' result.pmd | sed 's/.*Rule:\([^ ]*\).*/\1/' | sort | uniq -c | tee "code_health/code_health_$1_$(date +'%m-%d-%Y')"

```

And here is the output result:

```
➜  my-project git:(feat/code_health) ./source_code_health.sh project-id
     12 AtLeastOneConstructor
      1 AvoidDuplicateLiterals
      1 AvoidFieldNameMatchingMethodName
      1 AvoidFieldNameMatchingTypeName
      1 AvoidLiteralsInIfCondition
      2 CallSuperInConstructor
      1 CollapsibleIfStatements
      3 CommentDefaultAccessModifier
     26 DataClass
      8 ExcessiveParameterList
      1 ExcessivePublicCount
      3 ImmutableField
    102 LawOfDemeter
      4 LiteralsFirstInComparisons
     78 LocalVariableCouldBeFinal
    119 LongVariable
    626 MethodArgumentCouldBeFinal
     23 MissingSerialVersionUID
      2 NullAssignment
     27 OnlyOneReturn
      3 PrematureDeclaration
     56 ShortVariable
      2 SignatureDeclareThrowsException
      3 TooManyFields
      1 TooManyMethods
      4 UnnecessaryCaseChange
      1 UnnecessaryConstructor
      1 UnnecessaryLocalBeforeReturn
      5 UseLocaleWithCaseConversions
      5 UseObjectForClearerAPI
      2 UseUtilityClass
```

The file is also stored in *code_health* directory with a date stamp allowing us to commit and track how things evolve.

### Next Steps

It would be interesting to add a git-hook and ci/cd step that compares the previous code health with the current.

We have started separating the rule violations into *lots* and assigning them to developers at the end of a sprint. This will effectively allow us to parallelize the work and measure the progress with the new *source_code_health.sh* script.

## Archunit

The other tool we used to improve code quality was ArchUnit which is basically a unit testing framework for your architecture.

Of course we faced the same issue when we tried implementing our first rules. For example, there were tens of classes that did not respect our newly established rule that no *Command* class should reside outside of *com.project.application* package.

So instead of completely scrapping that rule or spending days on refactoring we ended up ignoring the list of offending classes by using the Archunit *ImportOption* API:

```java
@DisplayName("Command Handlers")
class CommandHandlersArchTest {
  List<String> badClasses = List.of(
      AccountHandler.class.getSimpleName(),
      CompanyHandler.class.getSimpleName(),
      ...
      and many others
      ...
  );

  ImportOption knownBadFiles = (Location location) -> {
    for (String badClass : badClasses) {
      if (location.contains(badClass)) {
        return false;
      }
    }

    return true;
  };

  @Test
  @DisplayName("Should be in the application layer")
  void noCommandsOutsideAppLayer() {
    JavaClasses importedClasses = new ClassFileImporter()
        .withImportOption(knownBadFiles)
        .importPackages("com.project");

    ArchRule rule = classes().that().implement(Command.Handler.class).should()
        .resideInAPackage("com.project.application");

    rule.check(importedClasses);
  }
}

```

Once again we ended up with a rule that protects any newly added code and that clearly lists the remaining work to be done on the legacy. We can now easily divide it among colleagues and advance in small increments whenever we have free time.

## Conclusion

When facing a big legacy codebase that needs improvement we need to divide and conquer the problem by finding a way to improve the code incrementally and measure the difference between each increment.

Do any alternative or better solutions exist for the problems discussed in this article? Probably yes (PMD incremental checks maybe). It is however worth noting that even with rudimentary scripting knowledge it still relatively easy to hack a shell script and achieve the end goal albeit adding some manual steps.

## Notes and References

[^pmd]: PMD check plugin: [https://docs.pmd-code.org/latest/pmd_userdocs_tools_maven.html](https://docs.pmd-code.org/latest/pmd_userdocs_tools_maven.html)
[^archunit]: Archunit user guide: [https://www.archunit.org/userguide/html/000_Index.html](https://www.archunit.org/userguide/html/000_Index.html)
